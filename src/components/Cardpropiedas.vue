<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <div class="container d-flex justify-content-center align-items-center p-3 m-5 rounded-pill shadow-lg red-bg text-white">
      <h1 class="text-center">Calles del Monopoly</h1>
    </div>

        <button type="button" class="btn fixed-bottom btn-warning mb-4 w-25 m-4 p-2 shadow-lg fs-4 fw-bold rounded-pill" @click="volverAPartida">
            Volver
        </button>
    

    <div v-for="prop in propiedades" :key="prop.id" class="card m-4 w-75">
      <div class="card-header text-center p-4" :style="{ backgroundColor: prop.color, color: 'white' }">
        <h3>{{ prop.nombre?.toUpperCase() || "Sin nombre" }}</h3>
      </div>

      <div class="card-body p-3 row">
        <ul class="list-unstyled mb-3 col-7">
          <li><strong>Renta base:</strong></li>
          <li><strong>Con set de color:</strong></li>
          <li><strong>Con <span class="text-success">🏠</span>:</strong></li>
          <li><strong>Con <span class="text-success">🏠🏠</span>:</strong></li>
          <li><strong>Con <span class="text-success">🏠🏠🏠</span>:</strong></li>
          <li><strong>Con <span class="text-success">🏠🏠🏠🏠</span>:</strong></li>
          <li><strong>Con <span class="text-danger">🏨</span>:</strong></li>
        </ul>

        <ul class="list-unstyled mb-3 col-5 text-end">
          <li><strong>M{{ prop.renta?.baseRenta || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.baseRenta*2|| 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.casa1 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.casa2 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.casa3 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.casa4 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.rentaHotel || 0 }}</strong></li>
        </ul>
      </div>

      <div class="row border-top" style="margin: 0;">
        <ul class="list-unstyled mb-3 col-7">
          <li><strong>Casa cuesta:</strong></li>
          <li><strong>Hotel cuesta:</strong></li>
          <li><strong>Precio:</strong></li>
        </ul>
        <ul class="list-unstyled mb-3 col-5 text-end">
          <li><strong>M{{ prop.costoEdificios }}</strong></li>
          <li><strong>M{{ prop.costoEdificios }}</strong></li>
          <li><strong>M{{ prop.precio }}</strong></li>
        </ul>
      </div>

      <div class=" row border-top bg-danger bg-opacity-25" style="margin: 0;">
        <ul class="list-unstyled mb-3 col-6">
          <li><strong>Hipoteca:</strong></li>
          <li><strong>Deshipoteca:</strong></li>

        </ul>
        <ul class="list-unstyled mb-3 col-6 text-end">
          <li><strong>M{{ prop.hipoteca }}</strong></li>
          <li><strong>M{{ (prop.hipoteca*0.1)+prop.hipoteca }}</strong></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { obtenerPropiedades } from '../firebase/obtenerPropiedades.js';

const route = useRoute();
const router = useRouter();
const codigo = route.params.codigo;

const volverAPartida = () => {
  router.push(`/cards/${codigo}`);
};

const propiedades = ref([]);

onMounted(async () => {
  propiedades.value = await obtenerPropiedades();
  console.log("📦 Propiedades cargadas:", propiedades.value);
});
</script>

<style scoped>
.red-bg {
  background-color: #FF0000;
}

</style>
