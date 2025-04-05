<template>
  <div class="container">
      <header id="header" class="filter d-flex h-25 w-100 justify-content-center align-items-center p-1 ">
          <img
          src="/Dinero.png"
          alt="Dinero"
          class="img-fluid filter w-25 "
          /> 
          <h1 id="titulo" class="text-center">Comercio</h1>
      </header>
      
      <div class="container">
          <div class="row ">
              <div class="col-12 col-md-6 mb-4 " v-for="n in 4" :key="n">
              <div class="card h-100 w-70 ">
                  <div class="card-header">
                  <h4 class="card-title p-2 ">Trueque</h4>
                  </div>
                  <div class="card-body">
                  <p class="card-text"> Jugador 1 <-- Comerciando --> Jugador 2</p>
                  </div>
                  <div class="card-footer">
                  <p class="card-text">Estado: Pendiente</p>
                  <button @click="CrearComercio" class="btn comerciar"> Comerciar</button>
                  </div>
              </div>
              </div>
          </div>
      </div>
          
          <div class="fixed-bottom m-2 justify-content-start align-items-start">
              <button
              type="button"
              class="btn boton-shadow btn-danger  w-25 m-2  fs-4 "
              @click="volverAPartida"
              >
              Volver
              </button>

              <button
              type="button"
              class="btn boton-shadow btn-warning  w-50 m-2 fs-4  "
              @click="CrearTrueque"
              >
              Crear Trueque
              </button>
          </div>
  </div>
</template>
  
  <script setup>
  import { useRoute, useRouter } from 'vue-router'
  import Swal from "sweetalert2";
  
  const route = useRoute()
  const router = useRouter()
  
    const volverAPartida = () => {
        const codigo = route.params.codigo
        router.push(`/partida/${codigo}`)
    }

    const CrearTrueque = () => {
        const codigo = route.params.codigo
        router.push(`/crearcomercio/${codigo}`)
    }


    const CrearComercio = async () => {
    const { value: formValues, dismiss } = await Swal.fire({
            title: "Comercio",
            html: `
                <div class="border border-2 rounded p-2">
                    <p> <strong> Personaje 1 te ofrece: </strong> </p>
                    <p>La propiedad </p>
                    <p>MEDITERRANEAN AVENUE</p>
                    <p>Monto: M0 </p>
                </div>

                <div class="border border-2 border mt-2 rounded p-2">
                    <p> <strong> Personaje 1 quiere de ti: </strong> </p>
                    <p>La propiedad </p>
                    <p>VIRGINIA AVENUE</p>
                    <p>Monto: M0 </p>
                </div>
            `,
            showCancelButton: true, // Habilita el botón de cancelar
            confirmButtonText: "Aceptar",
            cancelButtonText: "No me interesa!",
            focusConfirm: false,
            preConfirm: () => {
                return [];
            }
        });

        if (formValues) {
            //funcion de cuando se acepta el trueque
            Swal.fire("¡Aceptaste el trueque!");
        } else if (dismiss === Swal.DismissReason.cancel) {
            //funcion de cuando cancela el trueque 
            Swal.fire("Cancelaste el trueque.");
        }
    };
  </script>
  
  <style scoped>
  .boton-shadow {
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.857);
    transition: box-shadow 0.3s ease, transform 0.2s ease;
    }

  .boton-shadow:hover {
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.4);
    transform: translateY(-2px);
  }
  .filter{
    filter: drop-shadow(20 4px 10px rgba(0, 0, 0, 0.5));
  }
  #titulo{
    color: white;
    font-size: 42px;
    filter: drop-shadow(0px 0px 10px rgb(0, 0, 0));
  }
  .card{
    box-shadow: 4px 4px 10px 8px rgba(0, 0, 0, 0.2);
  }
  .container {
    text-align: center;
    padding: 20px;
  }
  .comerciar {
    background-color: #009e61;
    color: rgb(255, 255, 255);
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 5px;
  }
  .comerciar:hover {
    background-color: #00a447be;
  }
  </style>
  