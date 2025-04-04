<template>
    <div class="d-flex flex-column justify-content-center align-items-center">
      <div class="container d-flex justify-content-center align-items-center p-3 m-5 rounded-pill shadow-lg red-bg text-white">
        <h1 class="text-center">Estaciones del Monopoly</h1>
      </div>
  
      <button type="button" class="btn fixed-bottom btn-warning mb-4 w-25 m-4 p-2 shadow-lg fs-4 fw-bold rounded-pill" @click="volverAPartida">
        Volver
      </button>
  
      <div v-if="estaciones.length > 0">
        <div v-for="estacion in estaciones" :key="estacion.id" class="card m-5 w-75 position-relative">
          <div class="card-header d-flex justify-content-center bg-white">
            <img src="/trebMp.jpg" alt="Tren" class="img-fluid w-25" />
          </div>
  
          <h3 class="text-center mt-2">{{ estacion.nombre?.toUpperCase() || "Sin nombre" }}</h3>
  
          <div class="card-body row">
            <ul class="list-unstyled mb-3 col-7">
              <li><strong>Renta base:</strong></li>
              <li><strong>Si se poseen 2 estaciones:</strong></li>
              <li><strong>Si se poseen 3 estaciones:</strong></li>
              <li><strong>Si se poseen 4 estaciones:</strong></li>
            </ul>
            <ul class="list-unstyled mb-3 col-5 text-end">
              <li><strong>M25</strong></li>
              <li><strong>M50</strong></li>
              <li><strong>M100</strong></li>
              <li><strong>M200</strong></li>
            </ul>
          </div>
  
          <div class="row border-top" style="margin: 0;">
            <ul class="list-unstyled mb-3 col-7">
              <li><strong>Precio:</strong></li>
            </ul>
            <ul class="list-unstyled mb-3 col-5 text-end">
              <li><strong>M{{ estacion.precio }}</strong></li>
            </ul>
          </div>
  
          <div class="card-footer row border-top bg-danger bg-opacity-25" style="margin: 0;">
            <ul class="list-unstyled mb-3 col-6">
              <li><strong>Hipoteca:</strong></li>
              <li><strong>Deshipoteca:</strong></li>
            </ul>
            <ul class="list-unstyled mb-3 col-6 text-end">
              <li><strong>M{{ estacion.hipoteca }}</strong></li>
              <li><strong>M{{ calcularDeshipoteca(estacion.hipoteca) }}</strong></li>
            </ul>
          </div>
  
          <div class="row border-top p-3" style="margin: 0;">
            <div class="text-center">
              <strong>Propietario:</strong>
              <span v-if="estacion.propietario && estacion.propietario !== ''">{{ estacion.propietario }}</span>
              <span v-else class="fst-italic">Sin propietario</span>
            </div>
  
            <div class="row text-end col">
              <button class="btn btn-success btn-sm me-2 m-3 p-2 fw-bold" @click="comprar(estacion)" v-if="!estacion.propietario">
                Comprar
              </button>
  
              <template v-else-if="estacion.propietario === jugadorActual?.nombre">
                <button class="btn btn-primary btn-sm me-2 m-3 p-2 fw-bold" @click="Hipotecar(estacion)">
                  {{ estacion.hipotecada ? "Deshipotecar" : "Hipotecar" }}
                </button>
              </template>
  
              <template v-else>
                <button class="btn btn-danger btn-sm me-2 m-3 p-2 fw-bold" @click="pagarRenta(estacion)" v-if="!estacion.hipotecada">
                  Pagar Renta
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
  
      <div v-else>
        <p>Cargando estaciones...</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { obtenerEstaciones } from "../firebase/obtenerPropiedades";
  import Swal from "sweetalert2";
  import { getFirestore, doc, updateDoc, setDoc, getDocs, collection, getDoc, onSnapshot } from "firebase/firestore";
  import { getAuth } from "firebase/auth";
  
  const route = useRoute();
  const router = useRouter();
  const codigo = route.params.codigo;
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  
  const estaciones = ref([]);
  const jugadorActual = ref(null);
  
  const volverAPartida = () => {
    router.push(`/cards/${codigo}`);
  };
  
  const calcularDeshipoteca = (hipoteca) => {
    if (!hipoteca || isNaN(hipoteca)) return 0;
    return Math.round(hipoteca * 1.1);
  };
  
  onMounted(async () => {
    const baseEstaciones = await obtenerEstaciones();
    const refJugProp = collection(db, `partidas/${codigo}/jugadores_propiedades`);
    const snap = await getDocs(refJugProp);
    const dataJugProp = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
    estaciones.value = baseEstaciones
      .filter((e) => e.tipo === "estacion")
      .map((estacion) => {
        const encontrada = dataJugProp.find((p) => p.id === estacion.id);
        return encontrada
          ? { ...estacion, propietario: encontrada.jugadorNombre, hipotecada: encontrada.hipotecada, jugadorId: encontrada.jugadorId }
          : estacion;
      });
  
    if (user && codigo) {
      const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, user.uid);
      onSnapshot(jugadorRef, (docSnap) => {
        if (docSnap.exists()) {
          jugadorActual.value = { uid: user.uid, ...docSnap.data() };
        }
      });
    }
  });
  
  const comprar = async (estacion) => {
    if (!estacion.propietario && jugadorActual.value) {
      const result = await Swal.fire({
        title: `¿Deseas comprar ${estacion.nombre}?`,
        text: `Precio: M${estacion.precio}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Comprar"
      });
  
      if (result.isConfirmed) {
        if (jugadorActual.value.saldo < estacion.precio) {
          return Swal.fire("Fondos insuficientes", "No tienes suficiente saldo.", "error");
        }
  
        const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
        await updateDoc(jugadorRef, { saldo: jugadorActual.value.saldo - estacion.precio });
  
        await setDoc(doc(db, `partidas/${codigo}/jugadores_propiedades`, estacion.id), {
          id: estacion.id,
          jugadorId: jugadorActual.value.uid,
          jugadorNombre: jugadorActual.value.nombre,
          nombre: estacion.nombre,
          nivelRenta: "baseRenta",
          hipotecada: false
        });
  
        estacion.propietario = jugadorActual.value.nombre;
        estacion.jugadorId = jugadorActual.value.uid;
        estacion.hipotecada = false;
  
        Swal.fire("¡Compra realizada!", `${estacion.nombre} ahora es tuya.`, "success");
      }
    }
  };
  
  const Hipotecar = async (estacion) => {
    const estacionRef = doc(db, `partidas/${codigo}/jugadores_propiedades`, estacion.id);
  
    if (!estacion.hipotecada) {
      const result = await Swal.fire({
        title: `¿Deseas hipotecar ${estacion.nombre}?`,
        text: `Recibirás M${estacion.hipoteca}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Hipotecar"
      });
  
      if (result.isConfirmed) {
        estacion.hipotecada = true;
        await updateDoc(estacionRef, { hipotecada: true });
  
        const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, estacion.jugadorId);
        const jugadorSnap = await getDoc(jugadorRef);
        if (jugadorSnap.exists()) {
          const jugador = jugadorSnap.data();
          await updateDoc(jugadorRef, { saldo: jugador.saldo + estacion.hipoteca });
        }
  
        Swal.fire("¡Hecho!", `${estacion.nombre} ahora está hipotecada.`, "success");
      }
    } else {
      const costo = calcularDeshipoteca(estacion.hipoteca);
  
      const result = await Swal.fire({
        title: `¿Deseas deshipotecar ${estacion.nombre}?`,
        text: `Costará M${costo}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Pagar"
      });
  
      if (result.isConfirmed) {
        estacion.hipotecada = false;
        await updateDoc(estacionRef, { hipotecada: false });
  
        const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, estacion.jugadorId);
        const jugadorSnap = await getDoc(jugadorRef);
        if (jugadorSnap.exists()) {
          const jugador = jugadorSnap.data();
          await updateDoc(jugadorRef, { saldo: jugador.saldo - costo });
        }
  
        Swal.fire("¡Hecho!", `${estacion.nombre} ya no está hipotecada.`, "success");
      }
    }
  };
  
  const pagarRenta = async (estacion) => {
    if (!jugadorActual.value) return;
  
    const refJugadores = collection(db, `partidas/${codigo}/jugadores`);
    const receptorRef = doc(refJugadores, estacion.jugadorId);
    const pagadorRef = doc(refJugadores, jugadorActual.value.uid);
  
    const receptorSnap = await getDoc(receptorRef);
    if (!receptorSnap.exists()) {
      return Swal.fire("Error", "No se encontró al propietario.", "error");
    }
  
    const receptor = receptorSnap.data();
  
    const estacionesPropietario = estaciones.value.filter(
      (e) => e.tipo === "estacion" && e.propietario === estacion.propietario && !e.hipotecada
    );
  
    let renta = 0;
    const cantidad = estacionesPropietario.length;
  
    if (cantidad === 1) renta = 25;
    else if (cantidad === 2) renta = 50;
    else if (cantidad === 3) renta = 100;
    else if (cantidad === 4) renta = 200;
  
    if (jugadorActual.value.saldo < renta) {
      return Swal.fire("Saldo insuficiente", "No puedes pagar la renta.", "error");
    }
  
    await updateDoc(pagadorRef, { saldo: jugadorActual.value.saldo - renta });
    await updateDoc(receptorRef, { saldo: receptor.saldo + renta });
  
    Swal.fire("¡Renta pagada!", `Pagaste M${renta} a ${receptor.nombre}`, "success");
  };
  </script>
  
  <style scoped>
  .red-bg {
    background-color: #FF0000;
  }
  </style>
  