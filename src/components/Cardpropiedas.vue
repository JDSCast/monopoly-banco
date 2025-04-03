<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <div class="container d-flex justify-content-center align-items-center p-3 m-5 rounded-pill shadow-lg red-bg text-white">
      <h1 class="text-center">Calles del Monopoly</h1>
    </div>

        <button type="button" class="btn fixed-bottom btn-warning mb-4 w-25 m-4 p-2 shadow-lg fs-4 fw-bold rounded-pill" @click="volverAPartida">
            Volver
        </button>
    

    <div v-for="prop in propiedades" :key="prop.id" class="card m-4 w-75" >
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
        <div class=" row border-top  bg-opacity-25" style="margin: 0;">
            <div class="row border-top p-3" style="margin: 0;">

                <!-- Información del propietario -->
                <div class="text-center">
                    <strong>Propietario:</strong>
                    <span v-if="prop.propietario && prop.propietario !== ''">
                    {{ prop.propietario }}
                    </span>
                    <span v-else class="fst-italic">
                        Sin propietario
                    </span>
                    
                </div>
                <!-- Botones de acción -->
                <div class="row  text-end col">
                    <button class="btn btn-success btn-sm me-2 m-3 p-2" @click="comprar(prop)" v-if= "!prop.propietario  ">
                        {{ prop.propietario ? "Pagar Renta" : "Comprar" }}
                    </button>

                    <button class="btn btn-primary btn-sm me-2 m-3 p-2" @click="manejarCasasHotel(prop)" v-if="prop.propietario === `Jugador 1`">
                    Casas / Hotel
                    </button>
                    <button class="btn btn-success btn-sm me-2 m-3 p-2" @click="Hipotecar(prop)" v-if="prop.propietario === `Jugador 1`">
                        {{ prop.hipoteca ? "Hipotecar" : "Deshipotecar" }}
                    </button>
                    
                </div>
            </div>
             
        </div>
  
            
    </div>
  </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { obtenerPropiedades } from '../firebase/obtenerPropiedades.js';
    import Swal from "sweetalert2";

    const route = useRoute();
    const router = useRouter();
    const codigo = route.params.codigo;
    const jugadorActual = ref(null);
    const propiedades = ref([]);

    //obtener las propiedades
    onMounted(async () => {
    propiedades.value = await obtenerPropiedades();
    console.log("📦 Propiedades cargadas:", propiedades.value);
    });

    //funcion para volver a la partida
    const volverAPartida = () => {
    router.push(`/cards/${codigo}`);
    };

    //funcion para comprar la casa 
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
        prop.hipoteca = false;

        if (!prop.hipoteca) {

            const result = await Swal.fire({
            title: `¿Deseas Hipotecar la propiedad ${prop.nombre}?`,
            text: `Estás seguro que deseas hipotecar ${prop.nombre} por un precio de M${prop.hipoteca}`,
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

    //funcion para Casas y hotel
    const manejarCasasHotel = async (prop) => {

        //Validar que el usuario tenga todas las calles del mismo color.
        if (prop) {

            //se debe agregar una validacion para conocer cuantas calles tiene el jugador
            //del mismo color, para despues mostrarlas en las alertas
            const result = await Swal.fire({
                title: `¿Te faltan calles por comprar?`,
                text: `Primero debes comprar las calles: ${'calle 1'} , ${'calle 2'} que te faltan !!`,
                icon: "warning",
                
            });

        } 
        //funcion si el usuario no cumple la anterior condicion
        if(prop){
            const result = await Swal.fire({
                title: `¿Mejorar renta?`,
                html: `
                    <p><strong>Recuerda:</strong> Debes tener el mismo número de casas en las demás propiedades.</p>
                    <p><strong>Renta actual:</strong> <span style="color: green;">M150</span></p>
                    <p><strong>Si compras una casa:</strong> Tu renta pasará a <span style="color: red; font-weight: bold;">M200</span>.</p>
                `,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                cancelButtonText: "Cancelar",
                confirmButtonText: "Comprar casa",
            });
            if (result.isConfirmed) {
                prop.propietario = "Jugador 1"; 
                Swal.fire("Tu renta fue mejorada en!", `${prop.nombre}`,
                "success");
            }
        }
    };

    

    
</script>



<style scoped>
.red-bg {
  background-color: #FF0000;
}

</style>
