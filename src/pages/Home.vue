<template>
    <div class="container-inicio">
      <div class="card card-inicio">
        <div class="card-body card-body-inicio">
          <h2 class="text-center">Monopoly</h2>
          <p>Bienvenido, {{ userName }}</p>
          <div class="d-grid gap-2">
            <button class="btn btn-outline-primary" @click="$router.push('/create-game')">Crear partida</button>
            <button class="btn btn-outline-success" @click="$router.push('/join-game')">Unirse a partida</button>
            <button class="btn btn-danger" @click="handleLogout">Cerrar sesión</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
  import { getFirestore, doc, getDoc } from "firebase/firestore";
  
  export default {
    setup() {
      const user = ref(null);
      const userName = ref("");
      const router = useRouter();
      const auth = getAuth();
      const db = getFirestore();
  
      onMounted(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            user.value = currentUser;
  
            const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
            if (userDoc.exists()) {
              userName.value = userDoc.data().name;
            } else {
              userName.value = currentUser.displayName || "Usuario";
            }
          } else {
            user.value = null;
            userName.value = "";
          }
        });
  
        return () => unsubscribe();
      });
  
      const handleLogout = async () => {
        try {
          await signOut(auth);
          router.push("/login");
        } catch (error) {
          console.error("Error al cerrar sesión:", error.message);
        }
      };
  
      return { userName, handleLogout };
    },
  };
  </script>
  
  <style scoped>
  @import "../styles/home.css";
  </style>