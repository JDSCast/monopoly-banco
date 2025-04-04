<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <div class="container d-flex justify-content-center align-items-center p-3 m-5 rounded-pill shadow-lg red-bg text-white">
      <h1 class="text-center">Servicios del Monopoly</h1>
    </div>

    <button type="button" class="btn fixed-bottom btn-warning mb-4 w-25 m-4 p-2 shadow-lg fs-4 fw-bold rounded-pill" @click="volverAPartida">
      Volver
    </button>

    <div v-if="servicios.length > 0">
      <div
        v-for="servicio in servicios"
        :key="servicio.id"
        class="card w-50 mx-auto shadow-lg mb-4"
      >
        <div class="card-header d-flex justify-content-center bg-white">
          <img
            :src="getImagen(servicio.nombre)"
            :alt="servicio.nombre"
            class="img-fluid w-50"
          />
        </div>

        <div class="card-body text-center">
          <h3 class="mb-3">{{ servicio.nombre.toUpperCase() }}</h3>
          <p>
            Si un jugador cae aquí, paga
            {{ servicio.renta?.baseRenta || 4 }} veces el número mostrado en
            los dados.
          </p>
          <p>
            Si ambos servicios son poseídos, paga
            {{ servicio.renta?.setRenta || 10 }} veces el número mostrado
            en los dados.
          </p>
        </div>

        <div class="card-footer row border-top m-0">
          <ul class="list-unstyled mb-3 col-6">
            <li><strong>Precio:</strong></li>
          </ul>
          <ul class="list-unstyled mb-3 col-6 text-end">
            <li><strong>M{{ servicio.precio }}</strong></li>
          </ul>
        </div>

        <div class="card-footer row border-top bg-danger bg-opacity-25 m-0">
          <ul class="list-unstyled mb-3 col-6">
            <li><strong>Hipoteca:</strong></li>
            <li><strong>Deshipoteca:</strong></li>
          </ul>
          <ul class="list-unstyled mb-3 col-6 text-end">
            <li><strong>M{{ servicio.hipoteca }}</strong></li>
            <li><strong>M{{ calcularDeshipoteca(servicio.hipoteca) }}</strong></li>
          </ul>
        </div>

        <div class="row border-top p-3" style="margin: 0;">
          <div class="text-center">
            <strong>Propietario:</strong>
            <span v-if="servicio.propietario && servicio.propietario !== ''">{{ servicio.propietario }}</span>
            <span v-else class="fst-italic">Sin propietario</span>
          </div>

          <div class="row text-end col">
            <button
              class="btn btn-success btn-sm me-2 m-3 p-2 fw-bold"
              @click="comprar(servicio)"
              v-if="!servicio.propietario"
            >
              Comprar
            </button>

            <template v-else-if="servicio.propietario === jugadorActual?.nombre">
              <button
                class="btn btn-primary btn-sm me-2 m-3 p-2 fw-bold"
                @click="Hipotecar(servicio)"
              >
                {{ servicio.hipotecada ? "Deshipotecar" : "Hipotecar" }}
              </button>
            </template>

            <template v-else>
              <button
                class="btn btn-danger btn-sm me-2 m-3 p-2 fw-bold"
                @click="pagarRenta(servicio)"
                v-if="!servicio.hipotecada"
              >
                Pagar Renta
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <p>Cargando servicios...</p>
    </div>
  </div>
</template>

<script>
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { obtenerServicios } from "../firebase/obtenerPropiedades";
import Swal from "sweetalert2";
import { getFirestore, doc, updateDoc, setDoc, getDocs, collection, getDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  name: "CardService",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const codigo = route.params.codigo;
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    const servicios = ref([]);
    const jugadorActual = ref(null);

    const volverAPartida = () => {
      router.push(`/cards/${codigo}`);
    };

    const cargarServicios = async () => {
      const baseServicios = await obtenerServicios();
      const refJugProp = collection(db, `partidas/${codigo}/jugadores_propiedades`);
      const snap = await getDocs(refJugProp);
      const dataJugProp = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      servicios.value = baseServicios
        .filter((servicio) => servicio.tipo === "servicio")
        .map((servicio) => {
          const encontrada = dataJugProp.find((p) => p.id === servicio.id);
          return encontrada
            ? { ...servicio, propietario: encontrada.jugadorNombre, hipotecada: encontrada.hipotecada, jugadorId: encontrada.jugadorId }
            : servicio;
        });
    };

    const getImagen = (nombre) => {
      if (nombre.toLowerCase().includes("electric")) {
        return "/Electry.png";
      } else if (nombre.toLowerCase().includes("water")) {
        return "/Water.png";
      } else {
        return "/default-servicio.png";
      }
    };

    const calcularDeshipoteca = (hipoteca) => {
      if (!hipoteca || isNaN(hipoteca)) return 0;
      return Math.round(hipoteca * 1.1);
    };

    onMounted(async () => {
      await cargarServicios();
      if (user && codigo) {
        const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, user.uid);
        onSnapshot(jugadorRef, (docSnap) => {
          if (docSnap.exists()) {
            jugadorActual.value = { uid: user.uid, ...docSnap.data() };
          }
        });
      }
    });

    const comprar = async (servicio) => {
      if (!servicio.propietario && jugadorActual.value) {
        const result = await Swal.fire({
          title: `¿Deseas comprar ${servicio.nombre}?`,
          text: `Precio: M${servicio.precio}`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Comprar"
        });

        if (result.isConfirmed) {
          if (jugadorActual.value.saldo < servicio.precio) {
            return Swal.fire("Fondos insuficientes", "No tienes suficiente saldo.", "error");
          }

          const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
          await updateDoc(jugadorRef, { saldo: jugadorActual.value.saldo - servicio.precio });

          await setDoc(doc(db, `partidas/${codigo}/jugadores_propiedades`, servicio.id), {
            id: servicio.id,
            jugadorId: jugadorActual.value.uid,
            jugadorNombre: jugadorActual.value.nombre,
            nombre: servicio.nombre,
            nivelRenta: "baseRenta",
            hipotecada: false
          });

          servicio.propietario = jugadorActual.value.nombre;
          servicio.jugadorId = jugadorActual.value.uid;
          servicio.hipotecada = false;

          Swal.fire("¡Compra realizada!", `${servicio.nombre} ahora es tuyo.`, "success");
        }
      }
    };

    const Hipotecar = async (servicio) => {
      const servicioRef = doc(db, `partidas/${codigo}/jugadores_propiedades`, servicio.id);

      if (!servicio.hipotecada) {
        const result = await Swal.fire({
          title: `¿Deseas hipotecar ${servicio.nombre}?`,
          text: `Recibirás M${servicio.hipoteca}`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Hipotecar"
        });

        if (result.isConfirmed) {
          servicio.hipotecada = true;
          await updateDoc(servicioRef, { hipotecada: true });

          const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, servicio.jugadorId);
          const jugadorSnap = await getDoc(jugadorRef);
          if (jugadorSnap.exists()) {
            const jugador = jugadorSnap.data();
            await updateDoc(jugadorRef, { saldo: jugador.saldo + servicio.hipoteca });
          }

          Swal.fire("¡Hecho!", `${servicio.nombre} ahora está hipotecado.`, "success");
        }
      } else {
        const costo = calcularDeshipoteca(servicio.hipoteca);

        const result = await Swal.fire({
          title: `¿Deseas deshipotecar ${servicio.nombre}?`,
          text: `Costará M${costo}`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Pagar"
        });

        if (result.isConfirmed) {
          servicio.hipotecada = false;
          await updateDoc(servicioRef, { hipotecada: false });

          const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, servicio.jugadorId);
          const jugadorSnap = await getDoc(jugadorRef);
          if (jugadorSnap.exists()) {
            const jugador = jugadorSnap.data();
            await updateDoc(jugadorRef, { saldo: jugador.saldo - costo });
          }

          Swal.fire("¡Hecho!", `${servicio.nombre} ya no está hipotecado.`, "success");
        }
      }
    };

    const pagarRenta = async (servicio) => {
      if (!jugadorActual.value) return;

      const { value: dados } = await Swal.fire({
        title: "Número de los dados 🎲",
        input: "number",
        inputLabel: "Ingresa el total que salió en los dados",
        inputPlaceholder: "Ejemplo: 8",
        inputAttributes: {
          min: 2,
          max: 12,
          step: 1
        },
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar"
      });

      if (!dados || isNaN(dados) || dados < 2 || dados > 12) {
        return Swal.fire("Número inválido", "Debes ingresar un número entre 2 y 12.", "error");
      }

      const refJugadores = collection(db, `partidas/${codigo}/jugadores`);
      const receptorRef = doc(refJugadores, servicio.jugadorId);
      const pagadorRef = doc(refJugadores, jugadorActual.value.uid);

      const receptorSnap = await getDoc(receptorRef);
      if (!receptorSnap.exists()) {
        return Swal.fire("Error", "No se encontró al propietario.", "error");
      }

      const receptor = receptorSnap.data();

      const serviciosPropietario = servicios.value.filter(
        (s) => s.tipo === "servicio" && s.propietario === servicio.propietario
      );

      const tieneAmbosServicios = serviciosPropietario.length === 2 && serviciosPropietario.every((s) => !s.hipotecada);

      const multiplicador = tieneAmbosServicios ? (servicio.renta?.setRenta || 10) : (servicio.renta?.baseRenta || 4);
      const renta = dados * multiplicador;

      if (jugadorActual.value.saldo < renta) {
        return Swal.fire("Saldo insuficiente", "No puedes pagar la renta.", "error");
      }

      await updateDoc(pagadorRef, { saldo: jugadorActual.value.saldo - renta });
      await updateDoc(receptorRef, { saldo: receptor.saldo + renta });

      Swal.fire("¡Renta pagada!", `Pagaste M${renta} a ${receptor.nombre}`, "success");
    };

    return {
      codigo,
      volverAPartida,
      servicios,
      getImagen,
      calcularDeshipoteca,
      comprar,
      Hipotecar,
      pagarRenta,
      jugadorActual
    };
  },
};
</script>

<style scoped>
.red-bg {
  background-color: #ff0000;
}
</style>
