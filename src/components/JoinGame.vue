<template>
  <div class="container-join text-center">
    <div class="card card-join">
      <div class="card-body-join">
        <h3>Unirse a una partida</h3>
        <input
          type="text"
          class="form-control my-2"
          placeholder="Código de la partida"
          v-model="codigoIngresado"
          :disabled="esperandoInicio"
        />

        <div class="d-grid">
          <button class="btn btn-outline-success" @click="unirseAPartida" :disabled="esperandoInicio">
            {{ esperandoInicio ? "Esperando..." : "Unirse" }}
          </button>
          <button class="btn btn-danger mt-2" @click="$router.push('/inicio')">
            Cancelar
          </button>
        </div>

        <div v-if="esperandoInicio" class="mt-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Esperando...</span>
          </div>
        </div>

        <p v-if="mensaje" class="mt-2">{{ mensaje }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import Swal from "sweetalert2";

export default {
  setup() {
    const codigoIngresado = ref("");
    const mensaje = ref("");
    const esperandoInicio = ref(false);
    const partidaIniciada = ref(false);
    const jugadores = ref([]);
    const saldo = ref(1500);

    const auth = getAuth();
    const db = getFirestore();
    const router = useRouter();

    const unirseAPartida = async () => {
      try {
        if (!codigoIngresado.value) {
          Swal.fire("Error", "Debes ingresar un código de partida.", "error");
          return;
        }

        const partidaRef = doc(db, "partidas", codigoIngresado.value);
        const partidaSnap = await getDoc(partidaRef);

        if (!partidaSnap.exists()) {
          Swal.fire("Error", "El código de la partida no existe.", "error");
          return;
        }

        const user = auth.currentUser;
        if (!user) {
          Swal.fire("Error", "Debes iniciar sesión para unirte a una partida.", "error");
          return;
        }

        const { displayName, uid } = user;
        const jugadorActual = displayName || "Jugador";
        const partidaData = partidaSnap.data();

        if (partidaData.jugadores.some((j) => j.uid === uid)) {
          Swal.fire("Info", "Ya estás en esta partida.", "info");
          router.push("/partida/" + codigoIngresado.value);
          return;
        }

        const nuevoJugador = { nombre: jugadorActual, saldo: 1500, uid };
        await updateDoc(partidaRef, { jugadores: [...partidaData.jugadores, nuevoJugador] });

        esperandoInicio.value = true;
        Swal.fire({
            title: '¡Partida iniciada!',
            icon: 'success',
            confirmButtonText: 'Entrar a partida.'
          })
        
        mensaje.value = "Te has unido a la partida. Esperando que el anfitrión inicie...";

        // Escuchar cambios en la partida
        onSnapshot(partidaRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            jugadores.value = data.jugadores;

            const miJugador = data.jugadores.find((j) => j.uid === uid);
            if (miJugador) saldo.value = miJugador.saldo;

            if (data.estado === "iniciada") {
              partidaIniciada.value = true;
              esperandoInicio.value = false;
            }
          }
        });
      } catch (error) {
        console.error("Error al unirse a la partida:", error);
        Swal.fire("Error", "No se pudo unir a la partida.", "error");
      }
    };

    // Redirigir cuando la partida se inicie
    watchEffect(() => {
      if (partidaIniciada.value) {
        router.push("/partida/" + codigoIngresado.value);
      }
    });

    return {
      codigoIngresado,
      mensaje,
      esperandoInicio,
      partidaIniciada,
      jugadores,
      saldo,
      unirseAPartida,
    };
  },
};
</script>

<style scoped>
@import "../styles/joinGame.css";
</style>
