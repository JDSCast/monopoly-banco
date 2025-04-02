<template>
  <div class="fondo">
    <router-view />
    <!-- <ToastContainer /> -->
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

</script>

<style scoped>
.fondo {
  font-family: 'Luckiest Guy', cursive;
  background: url("./images/fondo.jpg") no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
}
</style>
