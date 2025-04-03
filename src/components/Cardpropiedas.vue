<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <div class="container d-flex justify-content-center align-items-center p-3 m-5 rounded-pill shadow-lg red-bg text-white">
      <h1 class="text-center">Calles del Monopoly</h1>
    </div>

    <button type="button" class="btn fixed-bottom btn-warning mb-4 w-25 m-4 p-2 shadow-lg fs-4 fw-bold rounded-pill" @click="volverAPartida">
      Volver
    </button>

    <div v-for="prop in propiedades" :key="prop.id" class="card m-4 w-75">
      <div class="card-header text-center p-4" :style="{ backgroundColor: prop.color, color: 'white' }">
        <h3>{{ prop.nombre?.toUpperCase() || "Sin nombre" }}</h3>
      </div>

      <div class="card-body p-3 row">
        <ul class="list-unstyled mb-3 col-7">
          <li><strong>Renta base:</strong></li>
          <li><strong>Con set de color:</strong></li>
          <li><strong>Con <span class="text-success">🏠</span>:</strong></li>
          <li><strong>Con <span class="text-success">🏠🏠</span>:</strong></li>
          <li><strong>Con <span class="text-success">🏠🏠🏠</span>:</strong></li>
          <li><strong>Con <span class="text-success">🏠🏠🏠🏠</span>:</strong></li>
          <li><strong>Con <span class="text-danger">🏨</span>:</strong></li>
        </ul>

        <ul class="list-unstyled mb-3 col-5 text-end">
          <li><strong>M{{ prop.renta?.baseRenta || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.baseRenta * 2 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.casa1 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.casa2 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.casa3 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.casa4 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.rentaHotel || 0 }}</strong></li>
        </ul>
      </div>

      <div class="row border-top" style="margin: 0;">
        <ul class="list-unstyled mb-3 col-7">
          <li><strong>Casa cuesta:</strong></li>
          <li><strong>Hotel cuesta:</strong></li>
          <li><strong>Precio:</strong></li>
        </ul>
        <ul class="list-unstyled mb-3 col-5 text-end">
          <li><strong>M{{ prop.costoEdificios }}</strong></li>
          <li><strong>M{{ prop.costoEdificios }}</strong></li>
          <li><strong>M{{ prop.precio }}</strong></li>
        </ul>
      </div>

      <div class="row border-top bg-danger bg-opacity-25" style="margin: 0;">
        <ul class="list-unstyled mb-3 col-6">
          <li><strong>Hipoteca:</strong></li>
          <li><strong>Deshipoteca:</strong></li>
        </ul>
        <ul class="list-unstyled mb-3 col-6 text-end">
          <li><strong>M{{ prop.hipoteca }}</strong></li>
          <li><strong>M{{ calcularDeshipoteca(prop.hipoteca) }}</strong></li>
        </ul>
      </div>

      <div class="row border-top p-3" style="margin: 0;">
        <div class="text-center">
          <strong>Propietario:</strong>
          <span v-if="prop.propietario && prop.propietario !== ''">{{ prop.propietario }}</span>
          <span v-else class="fst-italic">Sin propietario</span>
        </div>

        <div class="row text-end col">
          <button class="btn btn-success btn-sm me-2 m-3 p-2 fw-bold" @click="comprar(prop)" v-if="!prop.propietario">
            Comprar
          </button>

          <template v-else-if="prop.propietario === jugadorActual?.nombre">
            <button class="btn btn-primary btn-sm me-2 m-3 p-2" @click="manejarCasasHotel(prop)">
              Casas / Hotel
            </button>
            <button class="btn btn-success btn-sm me-2 m-3 p-2" @click="Hipotecar(prop)">
              {{ prop.hipoteca ? "Deshipotecar" : "Hipotecar" }}
            </button>
          </template>

          <template v-else>
            <button class="btn btn-danger btn-sm me-2 m-3 p-2" @click="pagarRenta(prop)">
              Pagar Renta
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { obtenerPropiedades } from '../firebase/obtenerPropiedades.js';
import Swal from 'sweetalert2';
import { getFirestore, doc, updateDoc, onSnapshot, setDoc, getDocs, collection, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const route = useRoute();
const router = useRouter();
const propiedades = ref([]);
const codigo = route.params.codigo;
const db = getFirestore();
const auth = getAuth();
const user = auth.currentUser;
const jugadorActual = ref(null);

const volverAPartida = () => {
  router.push(`/cards/${codigo}`);
};

onMounted(async () => {
  const baseProps = await obtenerPropiedades();
  const refJugProp = collection(db, `partidas/${codigo}/jugadores_propiedades`);
  const snap = await getDocs(refJugProp);
  const dataJugProp = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  propiedades.value = baseProps.map((prop) => {
    const encontrada = dataJugProp.find((p) => p.id === prop.id);
    return encontrada ? { ...prop, propietario: encontrada.jugadorNombre, hipotecada: encontrada.hipotecada, jugadorId: encontrada.jugadorId } : prop;
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

const calcularDeshipoteca = (hipoteca) => {
  if (!hipoteca || isNaN(hipoteca)) return 0;
  return Math.round(hipoteca * 1.1);
};

const pagarRenta = async (prop) => {
  const renta = prop.renta?.baseRenta || 0;
  if (!jugadorActual.value || jugadorActual.value.saldo < renta) {
    return Swal.fire("Saldo insuficiente", "No tienes suficiente saldo para pagar la renta.", "error");
  }

  const pagadorRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
  const receptorRef = doc(db, `partidas/${codigo}/jugadores`, prop.jugadorId);
  const receptorSnap = await getDoc(receptorRef);

  if (!receptorSnap.exists()) {
    return Swal.fire("Error", "No se encontró al propietario.", "error");
  }

  const receptor = receptorSnap.data();
  const nuevoSaldoPagador = jugadorActual.value.saldo - renta;
  const nuevoSaldoReceptor = (receptor.saldo || 0) + renta;

  await updateDoc(pagadorRef, { saldo: nuevoSaldoPagador });
  await updateDoc(receptorRef, { saldo: nuevoSaldoReceptor });

  Swal.fire("¡Renta pagada!", `Has pagado M${renta} a ${receptor.nombre}`, "success");
};

const comprar = async (prop) => {
  if (!prop.propietario && jugadorActual.value) {
    const result = await Swal.fire({
      title: `¿Deseas comprar la propiedad ${prop.nombre}?`,
      text: `Estás seguro que deseas comprar ${prop.nombre} para aumentar tus ingresos`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Comprar",
    });

    if (result.isConfirmed) {
      try {
        const nuevoSaldo = jugadorActual.value.saldo - prop.precio;
        if (nuevoSaldo < 0) {
          return Swal.fire("Fondos insuficientes", "No tienes suficiente saldo para comprar esta propiedad.", "error");
        }

        const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
        await updateDoc(jugadorRef, { saldo: nuevoSaldo });

        const propiedadRef = doc(db, `partidas/${codigo}/jugadores_propiedades`, prop.id);
        await setDoc(propiedadRef, {
          id: prop.id,
          jugadorId: jugadorActual.value.uid,
          jugadorNombre: jugadorActual.value.nombre,
          nombre: prop.nombre,
          nivelRenta: "baseRenta",
          hipotecada: false
        });

        prop.propietario = jugadorActual.value.nombre || "Jugador 1";
        Swal.fire("¡Compra realizada!", `${prop.nombre} ahora es tuya.`, "success");
      } catch (error) {
        console.error("Error al registrar la compra:", error);
        Swal.fire("Error", "No se pudo registrar la compra.", "error");
      }
    }
  }
};

const Hipotecar = async (prop) => {
  if (!prop.hipoteca) {
    const result = await Swal.fire({
      title: `¿Deseas Hipotecar la propiedad ${prop.nombre}?`,
      text: `Estás seguro que deseas hipotecar ${prop.nombre} por un precio de M${prop.hipoteca}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Hipotecar",
    });
    if (result.isConfirmed) {
      prop.hipoteca = true;
      Swal.fire("¡Hipoteca realizada!", `${prop.nombre} ahora está hipotecada.`, "success");
    }
  } else {
    const result = await Swal.fire({
      title: `¿Deseas Deshipotecar la propiedad ${prop.nombre}?`,
      text: `Estás seguro que deseas Deshipotecar ${prop.nombre} por un precio de M${calcularDeshipoteca(prop.hipoteca)}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Pagar Hipoteca",
    });
    if (result.isConfirmed) {
      prop.hipoteca = false;
      Swal.fire("¡Deshipoteca realizada!", `Propiedad: ${prop.nombre} ahora está deshipotecada.`, "success");
    }
  }
};

const manejarCasasHotel = async (prop) => {
  await Swal.fire({
    title: `¿Te faltan calles por comprar?`,
    text: `Primero debes comprar las calles: ${'calle 1'} , ${'calle 2'} que te faltan !!`,
    icon: "warning",
  });

  const result = await Swal.fire({
    title: `¿Mejorar renta?`,
    html: `
      <p><strong>Recuerda:</strong> Debes tener el mismo número de casas en las demás propiedades.</p>
      <p><strong>Renta actual:</strong> <span style="color: green;">M150</span></p>
      <p><strong>Si compras una casa:</strong> Tu renta pasará a <span style="color: red; font-weight: bold;">M200</span>.</p>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    cancelButtonText: "Cancelar",
    confirmButtonText: "Comprar casa",
  });

  if (result.isConfirmed) {
    Swal.fire("Tu renta fue mejorada en!", `${prop.nombre}`, "success");
  }
};
</script>

<style scoped>
.red-bg {
  background-color: #FF0000;
}
</style>