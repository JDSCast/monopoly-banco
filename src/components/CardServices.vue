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
              <li><strong>precio:</strong></li>
            </ul>
            <ul class="list-unstyled mb-3 col-6 text-end">
              <li><strong>M{{ servicio.precio }}</strong></li>
              
            </ul>
          </div>
          <!-- 🔽 Footer agregado -->
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

            <button class="btn btn-success btn-sm me-2 m-3 p-2" @click="comprar(servicio)" v-if= "!servicio.propietario ">
                {{ servicio.propietario ? "Pagar Renta" : "Comprar" }}
            </button>
            <button class="btn btn-success btn-sm me-2 m-3 p-2" @click="Hipotecar(servicio)" v-if="servicio.propietario === `Jugador 1`">
                {{ servicio.hipoteca ? "Hipotecar" : "Deshipotecar" }}
            </button>

        </div>
      </div>
  
      <div v-else>
        <p>Cargando servicios...</p>
      </div>
    </div>
  </template>
  
  <script>
  import { useRoute, useRouter } from "vue-router";
  import { ref, onMounted } from "vue";
  import { obtenerServicios } from "../firebase/obtenerPropiedades"; // ajusta el path si es necesario
  import Swal from "sweetalert2";

  export default {
    name: "CardService",
    setup() {
      const route = useRoute();
      const router = useRouter();
      const codigo = route.params.codigo;
  
      const servicios = ref([]);
  
      const volverAPartida = () => {
        router.push(`/cards/${codigo}`);
      };
  
      const cargarServicios = async () => {
        servicios.value = await obtenerServicios();
      };
  
      const getImagen = (nombre) => {
        if (nombre.toLowerCase().includes("electric")) {
          return "/Electry.png";
        } else if (nombre.toLowerCase().includes("water")) {
          return "/Water.png";
        } else {
          return "/default-servicio.png";
        }
      };
  
      const calcularDeshipoteca = (hipoteca) => {
        if (!hipoteca) return 0;
        return (hipoteca * 0.1 + hipoteca).toFixed(0); // redondeado a entero
      };
  
      onMounted(() => {
        cargarServicios();
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
  
      return {
        codigo,
        volverAPartida,
        servicios,
        getImagen,
        calcularDeshipoteca,
        comprar,
        Hipotecar
      };
    },

    
  };
  </script>
  
  <style scoped>
  .red-bg {
    background-color: #ff0000;
  }
  </style>
  