<template>
  <div class="container vh-100 d-flex align-items-center">
    <div class="row w-100">

      <!-- Columna de la imagen -->
      <div class="col-md-6 d-flex justify-content-center align-items-center">
        <img
          src="/Sr._Monopoly.jpg"
          alt="Sr. Monopoly"
          class="img-fluid  w-25"
        />
      </div>

      <!-- Columna de los botones -->
      <div class="col-md-6 d-flex justify-content-center align-items-center">
        <div class="bg-white pt-4 pb-4 shadow-lg rounded w-100 text-center">
          <h1 class="mb-4">Menú de Propiedades</h1>
          <div class="d-flex flex-column gap-3 align-items-center w-100">
            <button type="button" class="btn btn-danger p-2 fs-4 w-75" @click="VsPropiedades">
              Calles
            </button>
            <button type="button" class="btn btn-warning p-2 fs-4 w-75" @click="VsEstaciones">
              Estaciones
            </button>
            <button type="button" class="btn btn-success p-2 fs-4 w-75" @click="VsServicios">
              Servicios
            </button>
            <button type="button" class="btn btn-info p-2 fs-4 w-75" @click="volverAPartida">
              Volver
            </button>
          </div>
        </div>
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