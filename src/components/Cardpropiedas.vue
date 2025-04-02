<template>
    <div class="d-flex flex-column justify-content-center align-items-center">
        <div class="container d-flex justify-content-center align-items-center p-3 m-5 rounded-pill shadow-lg red-bg text-white">
            <h1 class="text-center">Calles del Monopoly</h1>
        </div>

        <button
              type="button"
              class="btn btn-secondary"
              @click="volverAPartida"
            >
              Volver
            </button>

        <div class="card m-5">
                <div class="card-header text-center p-4 orange-bg ">
                    <h3>MEDITERRANEAN AVENUE</h3>
                </div>
                
                <div class="card-body p-3 row">
                    <ul class="list-unstyled mb-3 col-7">
                        <li><strong>Rent:</strong></li> 
                        <li><strong>Rent with colour set:</strong></li>
                        <li><strong>Rent with <span class="text-success">🏠</span>:</strong></li>
                        <li><strong>Rent with <span class="text-success">🏠🏠</span>:</strong> </li>
                        <li><strong>Rent with <span class="text-success">🏠🏠🏠</span>:</strong> </li>
                        <li><strong>Rent with <span class="text-success">🏠🏠🏠🏠</span>:</strong> </li>
                        <li><strong>Rent with <span class="text-danger">🏨</span>:</strong> </li>
                    </ul>
                    <ul class="list-unstyled mb-3 col-5 text-end">
                        <li ><strong>M14</strong></li> 
                        <li><strong>M28</strong></li>
                        <li><strong>M70<span></span></strong> </li>
                        <li><strong>M200<span></span></strong> </li>
                        <li><strong>M200<span></span></strong> </li>
                        <li><strong>M140<span></span></strong></li>
                        <li><strong>M200<span></span></strong> </li>
                    </ul>
            </div>

            <div class=" card-header row border-top">
                <ul class="list-unstyled mb-3 col-6 ">
                        <li ><strong>Houses cost</strong></li> 
                        <li><strong>M28</strong></li>
                </ul>
                <ul class="list-unstyled mb-3 col-6 text-end">
                        <li ><strong>M 150 each</strong></li> 
                        <li><strong>M 150 each</strong> <br>
                            <small>(plus 4 houses)</small></li>
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

