<template>
    <div class="d-flex flex-column justify-content-center align-items-center ">
        <div class="container d-flex justify-content-center align-items-center p-3 m-5 rounded-pill shadow-lg red-bg text-white">
            <h1 class="text-center">Estaciones del Monopoly</h1>
        </div>

        <button
              type="button"
              class="btn btn-secondary"
              @click="volverAPartida"
            >
              Volver
            </button>

        <div class="card m-5 w-60 ">
               
                <div class="card-body p-3 row">
                    <div class="card-header d-flex justify-content-center bg-white">
                        <img src="/trebMp.jpg" alt="Tren" class="img-fluid w-50">
                    </div>
                    <h3 class="text-center">READING RAILROAD</h3>

                    <ul class="list-unstyled mb-3 col-7">
                        <li><strong>Rent:</strong></li> 
                        <li><strong>If 2 stations are owned</strong></li>
                        <li><strong>If 3 stations are owned <span class="text-success"></span>:</strong></li>
                        <li><strong>If 4 stations are owned<span class="text-success"></span>:</strong> </li>

                    </ul>
                    <ul class="list-unstyled mb-3 col-5 text-end">
                        <li ><strong>M 25</strong></li> 
                        <li><strong>M 50</strong></li>
                        <li><strong>M 100<span></span></strong> </li>
                        <li><strong>M 200<span></span></strong> </li>
                    </ul>
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
        router.push(`/cards/${codigo}`);
        };

        return { codigo, volverAPartida } // Se quitó el punto y coma aquí
    }
    };
</script>

<style scoped>
.red-bg {
  background-color: #FF0000; 
}
.orange-bg{
    background-color: #f59119; 
}
</style>


