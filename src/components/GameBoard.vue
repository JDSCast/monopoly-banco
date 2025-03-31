<template>
    <div class="container-game">
      <div class="card card-game">
        <div class="card-body-game">
          <h4>{{ jugadorActual?.nombre || "Jugador" }}</h4>
          <h4 class="text-center">${{ jugadorActual?.saldo || 0 }}</h4>
          <hr />
          
          <h5 class="text-center">Lista de participantes</h5>
          <ul class="list-group">
            <li v-for="(p, index) in partida?.jugadores?.filter(p => p.uid !== jugadorActual?.uid)" 
                :key="index" class="list-group-item d-flex justify-content-between">
              {{ p.nombre }} <span>${{ p.saldo }}</span>
            </li>
          </ul>
  
          <div class="d-flex justify-content-between mt-3 gap-2">
            <div class="dropdown">
              <button class="btn btn-secondary btn-despegable dropdown-toggle" type="button" 
                      data-bs-toggle="dropdown" aria-expanded="false">
                <BsBoxArrowRight />
              </button>
              <ul class="dropdown-menu">
                <li><button class="dropdown-item" @click="handleBancarrota">Bancarrota</button></li>
                <li><button class="dropdown-item" @click="handleSalir">Salir del juego</button></li>
              </ul>
            </div>
            <button class="btn btn-primary btn-transacciones" @click="$router.push(`/transaction/${codigo}`)">
              Transacciones
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { getFirestore, doc, onSnapshot } from "firebase/firestore";
  import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
  import { useToast } from "vue-toastification";
  import "../styles/gameBoard.css";
  
  export default {
    setup() {
      const route = useRoute();
      const router = useRouter();
      const codigo = route.params.codigo;
      const partida = ref(null);
      const jugadorActual = ref(null);
      const auth = getAuth();
      const db = getFirestore();
      const toast = useToast();
  
      onMounted(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
          if (user) {
            cargarPartida(user.uid);
          } else {
            router.push("/login");
          }
        });
        return () => unsubscribeAuth();
      });
  
      const cargarPartida = (userId) => {
        if (!codigo) return;
        const partidaRef = doc(db, "partidas", codigo);
        
        const unsub = onSnapshot(partidaRef, (docSnap) => {
          if (docSnap.exists()) {
            partida.value = docSnap.data();
            jugadorActual.value = partida.value.jugadores.find(j => j.uid === userId);
            
            const ultimaTransaccion = partida.value.transacciones?.slice(-1)[0];
            if (ultimaTransaccion && ultimaTransaccion.destino === jugadorActual.value?.nombre) {
              toast.info(`${ultimaTransaccion.origen} te transfirió $${ultimaTransaccion.monto}`, { autoClose: 5000, theme: "light" });
            }
          } else {
            router.push("/inicio");
          }
        });
        return () => unsub();
      };
  
      const handleBancarrota = () => {
        if (!jugadorActual.value || jugadorActual.value.saldo > 0) {
          alert("No puedes declararte en bancarrota si aún tienes saldo.");
          return;
        }
        router.push("/inicio");
      };
  
      const handleSalir = async () => {
        await signOut(auth);
        router.push("/login");
      };
  
      return { codigo, partida, jugadorActual, handleBancarrota, handleSalir };
    },
  };
  </script>
  
  <style scoped>
  @import "../styles/gameBoard.css";
  </style>