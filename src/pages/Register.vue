// Register.vue
<template>
  <div class="container-register">
    <div class="card card-register mx-auto">
      <div class="card-body card-body-register">
        <h2 class="text-center">Registro</h2>
        <form @submit.prevent="handleRegister">
          <div class="mb-3">
            <label class="form-label">Nombre de usuario</label>
            <input type="text" class="form-control" v-model="name" />
          </div>
          <div class="mb-3">
            <label class="form-label">Correo electrónico</label>
            <input type="email" class="form-control" v-model="email" />
          </div>
          <div class="mb-3">
            <label class="form-label">Contraseña</label>
            <input type="password" class="form-control" v-model="password" />
          </div>
          <div class="d-grid">
            <button type="submit" class="btn btn-primary">Registrarse</button>
          </div>
        </form>
        <p class="text-center mt-3">
          ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from 'vue-toastification';


export default {
  setup() {
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const router = useRouter();
    const toast = useToast();
    const auth = getAuth();
    const db = getFirestore();

    const verificarNombreUnico = async (nombre) => {
      const q = query(collection(db, "usuarios"), where("name", "==", nombre));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    };

    const handleRegister = async () => {
      if (!name.value || !email.value || !password.value) {
        toast.error("Todos los campos son obligatorios");
        return;
      }

      try {
        const existeNombre = await verificarNombreUnico(name.value);
        if (existeNombre) {
          toast.error("El nombre de usuario ya está en uso.");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name.value });

        await setDoc(doc(db, "usuarios", user.uid), {
          uid: user.uid,
          name: name.value,
          email: email.value,
        });
        console.log("inicia")
        toast.success("Registro exitoso. Inicia sesión.");
        router.push("/login");
      } catch (error) {
        handleAuthError(error.code);
      }
    };

    const handleAuthError = (errorCode) => {
      const errorMessages = {
        'auth/email-already-in-use': "El correo ya está registrado.",
        'auth/invalid-email': "Correo inválido.",
        'auth/weak-password': "La contraseña debe tener al menos 6 caracteres.",
      };
      toast.error(errorMessages[errorCode] || "Error al registrar. Inténtalo de nuevo.");
    };

    return { name, email, password, handleRegister };
  }
};
</script>

<style scoped>
@import '../styles/register.css';
</style>