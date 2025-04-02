<template>
    <div class="d-flex flex-column justify-content-center align-items-center ">
        <div class="container d-flex justify-content-center align-items-center p-3 m-5 rounded-pill shadow-lg red-bg text-white">
            <h1 class="text-center">Servicios del Monopoly</h1>
        </div>

        <button
              type="button"
              class="btn btn-secondary"
              @click="volverAPartida"
            >
              Volver
            </button>

            
            <div class="card w-50 mx-auto shadow-lg mb-4">
                    <div class="card-header d-flex justify-content-center bg-white">
                        <img src="/Electry.png" alt="Electric Company" class="img-fluid w-50">
                    </div>
                    <div class="card-body">
                        <h3 class="text-center mb-3">ELECTRIC COMPANY ⚡</h3>
                        <p class="text-center">Si un jugador cae aquí, paga 4 veces el número mostrado en los dados.</p>
                        <p class="text-center">Si ambos servicios son poseídos, paga 10 veces el número mostrado en los dados.</p>
                    </div>
            </div>

            <div class="card w-50 mx-auto shadow-lg">
                    <div class="card-header d-flex justify-content-center bg-white">
                        <img src="/Water.png" alt="Water Works" class="img-fluid w-50">
                    </div>
                    <div class="card-body">
                        <h3 class="text-center mb-3">WATER WORKS 💧</h3>
                        <p class="text-center">Si un jugador cae aquí, paga 4 veces el número mostrado en los dados.</p>
                        <p class="text-center">Si ambos servicios son poseídos, paga 10 veces el número mostrado en los dados.</p>
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


