<template>
    <div class="d-flex flex-column justify-content-center align-items-center ">
        <div class="container d-flex justify-content-center align-items-center p-3 m-5 rounded-pill shadow-lg red-bg text-white">
            <h1 class="text-center">Estaciones del Monopoly</h1>
        </div>

        <button type="button" class="btn fixed-bottom btn-warning mb-4 w-25 m-4 p-2 shadow-lg fs-4 fw-bold rounded-pill" @click="volverAPartida">
            Volver
        </button>

        <div v-for="estacion in estaciones" :key="estacion.id" class="card m-5 w-75">
            <div class="card-body p-3 row">
                <div class="card-header d-flex justify-content-center bg-white">
                    <img src="/trebMp.jpg" alt="Tren" class="img-fluid w-25">
                </div>
                <h3 class="text-center">{{ estacion.nombre?.toUpperCase() || "Sin nombre" }}</h3>

                <ul class="list-unstyled mb-3 col-7">
                    <li><strong>Renta base:</strong></li>
                    <li><strong>Si se poseen 2 estaciones:</strong></li>
                    <li><strong>Si se poseen 3 estaciones:</strong></li>
                    <li><strong>Si se poseen 4 estaciones:</strong></li>
                </ul>
                <ul class="list-unstyled mb-3 col-5 text-end">
                    <li><strong>M{{ estacion.renta?.baseRenta || 0 }}</strong></li>
                    <li><strong>M{{ estacion.renta?.estacion2 || 0 }}</strong></li>
                    <li><strong>M{{ estacion.renta?.estacion3 || 0 }}</strong></li>
                    <li><strong>M{{ estacion.renta?.estacion4 || 0 }}</strong></li>
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
                        <li><strong>M{{ (estacion.hipoteca*0.1)+estacion.hipoteca }}</strong></li>
                    </ul>
            </div>
            <button class="btn btn-success btn-sm me-2 m-3 p-2" @click="comprar(estacion)" v-if= "!estacion.propietario  ">
                {{ estacion.propietario ? "Pagar Renta" : "Comprar" }}
            </button>
            <button class="btn btn-success btn-sm me-2 m-3 p-2" @click="Hipotecar(estacion)" v-if="estacion.propietario === `Jugador 1`">
                {{ estacion.hipoteca ? "Hipotecar" : "Deshipotecar" }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { obtenerEstaciones } from '../firebase/obtenerPropiedades.js';
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();
const codigo = route.params.codigo;

const volverAPartida = () => {
    router.push(`/cards/${codigo}`);
};

const estaciones = ref([]);

onMounted(async () => {
    estaciones.value = await obtenerEstaciones();
    console.log("🚉 Estaciones cargadas:", estaciones.value);
});

//funcion para comprar la estacion
const comprar = async (prop) => {


    if (!prop.propietario) {

        const result = await Swal.fire({
        title: `¿Deseas comprar la propiedad ${prop.nombre}?`,
        text: `Estás seguro que deseas comprar ${prop.nombre} para aumentar tus ingresos`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: "Cancelar",
        confirmButtonText: "Comprar",
        });

        if (result.isConfirmed) {
            prop.propietario = "Jugador 1"; 
            Swal.fire("¡Compra realizada!", `${prop.nombre} ahora es tuya.`, "success");
        }

    } 
};


//funcion para hipotecar
const Hipotecar = async (prop) => {
    //recordar borrar esto es para pruebas para visualizar las alertas.
    prop.hipoteca =false;

    if (!prop.hipoteca) {

        const result = await Swal.fire({
            title: `¿Deseas liberar la hipoteca de la propiedad ${prop.nombre}?`,
            text: `Estás seguro que deseas liberar la hipoteca ${prop.nombre} por un precio de M${prop.hipoteca}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            cancelButtonText: "Cancelar",
            confirmButtonText: "Hipotecar",
        });

        if (result.isConfirmed) {
            prop.hipoteca = true;
            prop.propietario = "Jugador 1"; 
            Swal.fire("¡Hipoteca realizada!", `${prop.nombre} ahora esta hipotecada.`, "success");
        }

    } else{

        const result = await Swal.fire({
            title: `¿Deseas Deshipotecar la propiedad ${prop.nombre}?`,
            text: `Estás seguro que deseas Deshipotecar ${prop.nombre} por un precio de M${prop.Deshipoteca}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            cancelButtonText: "Cancelar",
            confirmButtonText: "Pagar Hipoteca",
        });

        if (result.isConfirmed) {
                prop.hipoteca = false;
                prop.propietario = "Jugador 1"; 
                Swal.fire("¡Deshipoteca realizada !", `Propiedad: ${prop.nombre} ahora esta deshipotecada.`, "success");
        }

    } 
};

</script>

<style scoped>
.red-bg {
  background-color: #FF0000; 
}
.orange-bg {
  background-color: #f59119; 
}
</style>


