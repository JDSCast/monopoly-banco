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
            <button class="btn btn-success" @click="unirseAPartida" :disabled="esperandoInicio">
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
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
  import { useToast } from "vue-toastification";
  
  export default {
    setup() {
      const codigoIngresado = ref("");
      const mensaje = ref("");
      const esperandoInicio = ref(false);
      const partidaIniciada = ref(false);
      const jugadores = ref([]);
      const saldo = ref(1500);
      const toast = useToast();
      const auth = getAuth();
      const db = getFirestore();
      const router = useRouter();
  
      const unirseAPartida = async () => {
        if (!codigoIngresado.value) {
          toast.error("Ingresa un código válido.", { autoClose: 3000, theme: "light" });
          return;
        }
  
        const user = auth.currentUser;
        if (!user) {
          mensaje.value = "Debes iniciar sesión.";
          toast.error("Debes iniciar sesión.", { autoClose: 3000, theme: "light" });
          return;
        }
  
        const { displayName, uid } = user;
        const jugadorActual = displayName || "Jugador";
        const partidaRef = doc(db, "partidas", codigoIngresado.value);
        const partidaSnap = await getDoc(partidaRef);
  
        if (partidaSnap.exists()) {
          const partidaData = partidaSnap.data();
          
          if (partidaData.jugadores.some(j => j.uid === uid)) {
            mensaje.value = "Ya estás en esta partida.";
            toast.info("Ya estás en esta partida.", { autoClose: 3000, theme: "light" });
            router.push("/partida/" + codigoIngresado.value);
            return;
          }
  
          const nuevoJugador = { nombre: jugadorActual, saldo: 1500, uid };
          await updateDoc(partidaRef, { jugadores: [...partidaData.jugadores, nuevoJugador] });
  
          esperandoInicio.value = true;
          toast.success("Te has unido a la partida.", { autoClose: 3000, theme: "light" });
          mensaje.value = "Te has unido a la partida. Esperando que el anfitrión inicie...";
  
          onSnapshot(partidaRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              jugadores.value = data.jugadores;
              
              const miJugador = data.jugadores.find(j => j.uid === uid);
              if (miJugador) saldo.value = miJugador.saldo;
  
              if (data.estado === "iniciada") {
                partidaIniciada.value = true;
                esperandoInicio.value = false;
              }
            }
          });
        } else {
          toast.error("La partida no existe.", { autoClose: 3000, theme: "light" });
        }
      };
  
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