<template> 
  <div class="d-flex flex-column justify-content-center align-items-center">
    <div class="container d-flex justify-content-center align-items-center p-3 m-5 rounded-pill shadow-lg red-bg text-white">
      <h1 class="text-center">Estaciones del Monopoly</h1>
    </div>

    <button type="button" class="btn fixed-bottom btn-warning mb-4 w-25 m-4 p-2 shadow-lg fs-4 fw-bold rounded-pill" @click="volverAPartida">
      Volver
    </button>

    <div v-if="estaciones.length > 0">
      <div v-for="estacion in estaciones" :key="estacion.id" class="card m-5 w-75 position-relative">
        <div class="card-header d-flex justify-content-center bg-white">
          <img src="/trebMp.jpg" alt="Tren" class="img-fluid w-25" />
        </div>

        <h3 class="text-center mt-2">{{ estacion.nombre?.toUpperCase() || "Sin nombre" }}</h3>

        <div class="card-body row">
          <ul class="list-unstyled mb-3 col-7">
            <li><strong>Renta base:</strong></li>
            <li><strong>Si se poseen 2 estaciones:</strong></li>
            <li><strong>Si se poseen 3 estaciones:</strong></li>
            <li><strong>Si se poseen 4 estaciones:</strong></li>
          </ul>
          <ul class="list-unstyled mb-3 col-5 text-end">
            <li><strong>M25</strong></li>
            <li><strong>M50</strong></li>
            <li><strong>M100</strong></li>
            <li><strong>M200</strong></li>
          </ul>
        </div>

        <div class="row border-top" style="margin: 0;">
          <ul class="list-unstyled mb-3 col-7">
            <li><strong>Precio:</strong></li>
          </ul>
          <ul class="list-unstyled mb-3 col-5 text-end">
            <li><strong>M{{ estacion.precio }}</strong></li>
          </ul>
        </div>

        <div class="card-footer row border-top bg-danger bg-opacity-25" style="margin: 0;">
          <ul class="list-unstyled mb-3 col-6">
            <li><strong>Hipoteca:</strong></li>
            <li><strong>Deshipoteca:</strong></li>
          </ul>
          <ul class="list-unstyled mb-3 col-6 text-end">
            <li><strong>M{{ estacion.hipoteca }}</strong></li>
            <li><strong>M{{ calcularDeshipoteca(estacion.hipoteca) }}</strong></li>
          </ul>
        </div>

        <div class="row border-top p-3" style="margin: 0;">
          <div class="text-center">
            <strong>Propietario:</strong>
            <span v-if="estacion.propietario && estacion.propietario !== ''">{{ estacion.propietario }}</span>
            <span v-else class="fst-italic">Sin propietario</span>
          </div>

          <div class="row text-end col">
            <button class="btn btn-success btn-sm me-2 m-3 p-2 fw-bold" @click="comprar(estacion)" v-if="!estacion.propietario">
              Comprar
            </button>

            <template v-else-if="estacion.propietario === jugadorActual?.nombre">
              <button class="btn btn-primary btn-sm me-2 m-3 p-2 fw-bold" @click="Hipotecar(estacion)">
                {{ estacion.hipotecada ? "Deshipotecar" : "Hipotecar" }}
              </button>
            </template>

            <template v-else>
              <button class="btn btn-danger btn-sm me-2 m-3 p-2 fw-bold" @click="pagarRenta(estacion)" v-if="!estacion.hipotecada">
                Pagar Renta
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <p>Cargando estaciones...</p>
    </div>
  </div>
</template>

<script setup>
import { useFunctionTrain } from '../scripts/functionTrain';

const {
  codigo,
  estaciones,
  jugadorActual,
  comprar,
  pagarRenta,
  Hipotecar,
  calcularDeshipoteca,
  volverAPartida
} = useFunctionTrain();
</script>

<style scoped>
.red-bg {
  background-color: #FF0000;
}
</style>
