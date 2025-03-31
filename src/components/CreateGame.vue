<template>
  <div class="container-create text-center">
    <div class="card card-create">
      <div class="card-body card-body-create">
        <h3 class="me-2">Código: {{ codigo }}</h3>
        <h5>Estado de la partida: <span class="badge bg-info">{{ estado }}</span></h5>
        <h4>Lista de participantes</h4>
        <ul class="list-group">
          <li v-for="(p, index) in participantes" :key="index" class="list-group-item">
            {{ p.nombre }} - ${{ p.saldo }}
          </li>
        </ul>
        <div v-if="estado === 'No iniciada'" class="d-grid">
          <button class="btn btn-primary mt-3" @click="iniciarPartida">Iniciar partida</button>
          <button class="btn btn-danger mt-3" @click="$router.push('/inicio')">Volver</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getFirestore, doc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  setup() {
    const codigo = ref("");
    const participantes = ref([]);
    const estado = ref("No iniciada");
    const auth = getAuth();
    const db = getFirestore();
    const router = useRouter();
    const isExecuted = ref(false);

    const generarCodigo = () => Math.floor(1000 + Math.random() * 9000).toString();

    onMounted(async () => {
      if (isExecuted.value) return;
      isExecuted.value = true;
      
      const user = auth.currentUser;
      if (!user) return;

      const userNombre = user.displayName || "Jugador";
      const nuevoCodigo = generarCodigo();
      const partidasRef = doc(db, "partidas", nuevoCodigo);

      await setDoc(partidasRef, {
        codigo: nuevoCodigo,
        estado: "No iniciada",
        uidCreador: user.uid,
        usuarioCreador: userNombre,
        jugadores: [{ uid: user.uid, nombre: userNombre, saldo: 1500 }]
      });

      codigo.value = nuevoCodigo;
      participantes.value = [{ uid: user.uid, nombre: userNombre, saldo: 1500 }];
      estado.value = "No iniciada";

      const unsub = onSnapshot(partidasRef, (docSnap) => {
        if (docSnap.exists()) {
          participantes.value = docSnap.data().jugadores;
          estado.value = docSnap.data().estado;

          if (docSnap.data().estado === "iniciada") {
            router.push(`/partida/${nuevoCodigo}`);
          }
        }
      });
    });

    const iniciarPartida = async () => {
      const partidaRef = doc(db, "partidas", codigo.value);
      await updateDoc(partidaRef, { estado: "iniciada" });
    };

    return { codigo, participantes, estado, iniciarPartida };
  },
};
</script>

<style scoped>
@import "../styles/createGame.css";
</style>