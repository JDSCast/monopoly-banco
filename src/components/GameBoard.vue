<template>
  <div class="container vh-100 d-flex align-items-center justify-content-center">
    <div class="row w-100 flex-column flex-md-row align-items-center ">

      <!-- Columna de la imagen -->
      <div class="col-md-5 d-flex justify-content-center mb-3 mb-md-0 img-espacio" >
        <img src="/Logo_monopoly.jpg" alt="Sr. Monopoly" class="w-50 img-espacio"/>
      </div>

      <!-- Columna de la tarjeta con la información del jugador -->
      <div class="col-md-7 d-flex justify-content-center ">
        <div class="card card-game p-4 w-100 shadow-lg">
          <div class="card-body-game text-center">
            <h4>{{ jugadorActual?.nombre || "Jugador" }}</h4>
            <h4 class="text-center fw-bold">${{ jugadorActual?.saldo || 0 }}</h4>
            <hr />

            <h5 class="text-center">Lista de participantes</h5>
            <ul class="list-group">
              <li v-for="(p, index) in partida?.jugadores?.filter(p => p.uid !== jugadorActual?.uid)" 
                  :key="index" 
                  class="list-group-item d-flex justify-content-between">
                {{ p.nombre }} <span>${{ p.saldo }}</span>
              </li>
            </ul>

            <!-- Botones -->
            <div class="d-flex justify-content-between mt-3 gap-2 flex-column flex-sm-row ">
              <div class="">
                <button class="btn btn-warning w-100 w-sm-auto mt-2" @click="$router.push(`/comercio/${codigo}`)">
                  Comercio
                </button>
                <button class="btn btn-primary w-100 w-sm-auto mt-2" @click="$router.push(`/transaction/${codigo}`)">
                  Transacciones
                </button>
                <button class="btn btn-success w-100 w-sm-auto mt-2" @click="$router.push(`/cards/${codigo}`)">
                  Propiedades
                </button>
              </div>
              <div class="dropdown ">
                <button class="m-2 btn text-center btn-secondary dropdown-toggle w-70 " type="button" 
                        data-bs-toggle="dropdown" aria-expanded="false">
                  <BsBoxArrowRight />
                </button>
                <ul class="dropdown-menu">
                  <li><button class="dropdown-item" @click="handleBancarrota">Bancarrota</button></li>
                  <li><button class="dropdown-item" @click="handleSalir">Salir del juego</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { getFirestore, doc, onSnapshot, collection, updateDoc } from "firebase/firestore";
  import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
  import Swal from "sweetalert2";
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
  
      const cargarPartida = async (userId) => {
        if (!codigo) return;
  
        const partidaRef = doc(db, "partidas", codigo);
  
        // Escuchar cambios en el documento de la partida
        const unsubPartida = onSnapshot(partidaRef, (docSnap) => {
          if (docSnap.exists()) {
            partida.value = docSnap.data();
          } else {
            router.push("/inicio");
          }
        });
  
        // Escuchar cambios en la subcolección "jugadores"
        const jugadoresRef = collection(db, `partidas/${codigo}/jugadores`);
        const unsubJugadores = onSnapshot(jugadoresRef, (querySnapshot) => {
          const jugadores = querySnapshot.docs.map((doc) => doc.data());
          partida.value = { ...partida.value, jugadores };
          jugadorActual.value = jugadores.find((j) => j.uid === userId);
        });
  
        return () => {
          unsubPartida();
          unsubJugadores();
        };
      };
  
      const handleBancarrota = async () => {
        if (!jugadorActual.value) {
          Swal.fire("Error", "No se pudo identificar al jugador actual.", "error");
          return;
        }
  
        const result = await Swal.fire({
          title: "Confirmar bancarrota",
          text: "Tu saldo será establecido en cero y saldrás del juego.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          cancelButtonText: "Cancelar",
          confirmButtonText: "Aceptar",
        });
  
        if (result.isConfirmed) {
          const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
          await updateDoc(jugadorRef, { saldo: 0 });
  
          Swal.fire("Bancarrota", "Te has declarado en bancarrota. Tu saldo ahora es cero.", "success");
          router.push("/inicio");
        }
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