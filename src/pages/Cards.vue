<template>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div class="container text-center">
        <h1>Menú de Propiedades</h1>
            <div class="d-flex flex-column gap-3 align-items-center mt-4 w-100">
            <button
              type="button"
              class="btn btn-primary btn-lg m-2 w-100"
              @click="VsPropiedades"
            >
              Calles
            </button>
            
            <button
              type="button"
              class="btn btn-primary btn-lg m-2 w-100"
              @click="VsEstaciones"
            >
              Estaciones
            </button>
            
            <button
              type="button"
              class="btn btn-primary btn-lg m-2 w-100"
              @click="VsServicios"
            >
              Servicios
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="volverAPartida"
            >
              Volver
            </button>
        </div>
        <div class="mt-4">
        <router-view></router-view> <!-- Aquí se mostrarán los componentes según la ruta -->
        </div>
    </div>
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router';

export default {
  name: "MenuPropiedades",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const codigo = route.params.codigo; // Capturar el parámetro de la URL
        
    const volverAPartida = () => {
      router.push(`/partida/${codigo}`);
    };

    const VsPropiedades = () => {
      router.push(`/propiedades/${codigo}`);
    };

    const VsEstaciones = () => {
      router.push(`/estaciones/${codigo}`);
    };

    const VsServicios = () => {
      router.push(`/servicios/${codigo}`);
    };

    return { codigo, volverAPartida, VsPropiedades, VsEstaciones, VsServicios } // Se quitó el punto y coma aquí
  }
};
</script>