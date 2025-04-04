<template>
    <div class="container">
      <header
        id="header"
        class="d-flex flex-column justify-content-center align-items-center p-2 m-0 w-100 text-white"
      >
        <h1 class="text-center mb-3">Crear comercio</h1>
        <div class="d-flex justify-content-center align-items-center gap-4">
          <h3 class="mb-0">Personaje 1</h3>
          <h3 class="mb-0">M1500</h3>
        </div>
      </header>
  
      <main class="bg-white border border-2 mt-2 mb-2 p-2">
        <p>Seleccionar jugador para realizar comercio</p>
        <h4>Jugadores</h4>
        <div class="dropdown">
          <button
            class="btn btn-secondary dropdown-toggle"
            type="button"
            id="dropdownPersonas"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {{ jugadorSeleccionado || 'Elegir Jugador' }}
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownPersonas">
            <li
              v-for="jugador in jugadores"
              :key="jugador"
              @click="jugadorSeleccionado = jugador"
            >
              <a class="dropdown-item" href="#">{{ jugador }}</a>
            </li>
          </ul>
        </div>
      </main>
  
      <aside class="bg-white border border-2 p-2">
        <h3>Ofrecer:</h3>
        <div>
          <h4>Propiedades</h4>
          <div class="dropdown">
            <button
              class="btn btn-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              {{ propiedadOfrecida || 'Elegir propiedad' }}
            </button>
            <ul class="dropdown-menu">
              <li
                v-for="prop in propiedades"
                :key="prop"
                @click="propiedadOfrecida = prop"
              >
                <a class="dropdown-item" href="#">{{ prop }}</a>
              </li>
            </ul>
          </div>
          <h4 class="mt-2">Dinero</h4>
          <input class="form-control" v-model="dineroOfrecido" type="number" />
        </div>
  
        <h3 class="mt-4">Solicitar:</h3>
        <div>
          <h4>Propiedades</h4>
          <div class="dropdown">
            <button
              class="btn btn-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              {{ propiedadSolicitada || 'Elegir propiedad' }}
            </button>
            <ul class="dropdown-menu">
              <li
                v-for="prop in propiedades"
                :key="prop"
                @click="propiedadSolicitada = prop"
              >
                <a class="dropdown-item" href="#">{{ prop }}</a>
              </li>
            </ul>
          </div>
          <h4 class="mt-2">Dinero</h4>
          <input class="form-control" v-model="dineroSolicitado" type="number" />
        </div>
  
        <div class="m-3 d-flex justify-content-center">
          <button class="btn btn-primary m-2" @click="enviarComercio">Enviar</button>
          <button class="btn btn-danger m-2" @click="cancelar">Cancelar</button>
        </div>
      </aside>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { getAuth } from 'firebase/auth';
  import { useRoute, useRouter } from 'vue-router';
  
  export default {
    name: 'Transaction',
    setup() {
      const route = useRoute();
      const router = useRouter();
      const auth = getAuth();
  
      const codigo = route.params.codigo;
      const usuarioActual = auth.currentUser;
  
      // Datos simulados, los del backend deben reemplazar esto con peticiones reales
      const jugadores = ref(['persona 1', 'persona 2', 'persona 3']);
      const propiedades = ref(['Propiedad 1', 'Propiedad 2', 'Propiedad 3']);
  
      const jugadorSeleccionado = ref(null);
      const propiedadOfrecida = ref(null);
      const dineroOfrecido = ref(0);
      const propiedadSolicitada = ref(null);
      const dineroSolicitado = ref(0);
  
      const enviarComercio = () => {
        const comercio = {
          de: usuarioActual?.uid || 'usuario_prueba',
          para: jugadorSeleccionado.value,
          ofrecer: {
            propiedad: propiedadOfrecida.value,
            dinero: dineroOfrecido.value,
          },
          solicitar: {
            propiedad: propiedadSolicitada.value,
            dinero: dineroSolicitado.value,
          },
          codigoPartida: codigo,
        };
  
        console.log('Comercio enviado:', comercio);
        // Aquí el backend puede hacer fetch o emitir por socket/fetch/post
      };
  
      const cancelar = () => {
        router.push(`/comercio/${codigo}`);
        };
  
      return {
        jugadores,
        propiedades,
        jugadorSeleccionado,
        propiedadOfrecida,
        dineroOfrecido,
        propiedadSolicitada,
        dineroSolicitado,
        enviarComercio,
        cancelar,
      };
    },
  };

  </script>
  
  <style scoped>
  @import "../styles/crearcomercio.css";
  
  header {
    background-color: #8e3434;
    box-shadow: 4px 4px 10px 8px rgba(0, 0, 0, 0.2);
  }
  </style>
  