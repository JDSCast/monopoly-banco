<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <div class="container d-flex justify-content-center align-items-center p-3 m-5 rounded-pill shadow-lg red-bg text-white">
      <h1 class="text-center">Servicios del Monopoly</h1>
    </div>

    <button type="button" class="btn fixed-bottom btn-warning mb-4 w-25 m-4 p-2 shadow-lg fs-4 fw-bold rounded-pill" @click="volverAPartida">
      Volver
    </button>

    <div v-if="servicios.length > 0">
      <div
        v-for="servicio in servicios"
        :key="servicio.id"
        class="card w-50 mx-auto shadow-lg mb-4"
      >
        <div class="card-header d-flex justify-content-center bg-white">
          <img
            :src="getImagen(servicio.nombre)"
            :alt="servicio.nombre"
            class="img-fluid w-50"
          />
        </div>

        <div class="card-body text-center">
          <h3 class="mb-3">{{ servicio.nombre.toUpperCase() }}</h3>
          <p>
            Si un jugador cae aquí, paga
            {{ servicio.renta?.baseRenta || 4 }} veces el número mostrado en
            los dados.
          </p>
          <p>
            Si ambos servicios son poseídos, paga
            {{ servicio.renta?.setRenta || 10 }} veces el número mostrado
            en los dados.
          </p>
        </div>

        <div class="card-footer row border-top m-0">
          <ul class="list-unstyled mb-3 col-6">
            <li><strong>Precio:</strong></li>
          </ul>
          <ul class="list-unstyled mb-3 col-6 text-end">
            <li><strong>M{{ servicio.precio }}</strong></li>
          </ul>
        </div>

        <div class="card-footer row border-top bg-danger bg-opacity-25 m-0">
          <ul class="list-unstyled mb-3 col-6">
            <li><strong>Hipoteca:</strong></li>
            <li><strong>Deshipoteca:</strong></li>
          </ul>
          <ul class="list-unstyled mb-3 col-6 text-end">
            <li><strong>M{{ servicio.hipoteca }}</strong></li>
            <li><strong>M{{ calcularDeshipoteca(servicio.hipoteca) }}</strong></li>
          </ul>
        </div>

        <div class="row border-top p-3" style="margin: 0;">
          <div class="text-center">
            <strong>Propietario:</strong>
            <span v-if="servicio.propietario && servicio.propietario !== ''">{{ servicio.propietario }}</span>
            <span v-else class="fst-italic">Sin propietario</span>
          </div>

          <div class="row text-end col">
            <button
              class="btn btn-success btn-sm me-2 m-3 p-2 fw-bold"
              @click="comprar(servicio)"
              v-if="!servicio.propietario"
            >
              Comprar
            </button>

            <template v-else-if="servicio.propietario === jugadorActual?.nombre">
              <button
                class="btn btn-primary btn-sm me-2 m-3 p-2 fw-bold"
                @click="Hipotecar(servicio)"
              >
                {{ servicio.hipotecada ? "Deshipotecar" : "Hipotecar" }}
              </button>
            </template>

            <template v-else>
              <button
                class="btn btn-danger btn-sm me-2 m-3 p-2 fw-bold"
                @click="pagarRenta(servicio)"
                v-if="!servicio.hipotecada"
              >
                Pagar Renta
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <p>Cargando servicios...</p>
    </div>
  </div>
</template>

<script setup>
import { useFunctionServices } from "../scripts/functionServices";

const {
  codigo,
  volverAPartida,
  servicios,
  getImagen,
  calcularDeshipoteca,
  comprar,
  Hipotecar,
  pagarRenta,
  jugadorActual
} = useFunctionServices();
</script>

<style scoped>
.red-bg {
  background-color: #ff0000;
}
</style>
