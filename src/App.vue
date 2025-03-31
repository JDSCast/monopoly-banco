<template>
  <div class="fondo">
    <router-view />
    <!-- <ToastContainer /> -->
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import { createRouter, createWebHistory } from 'vue-router';
// import ToastContainer from 'vue-toastification';
// import Hola from './components/Hola.vue';
// import Home from './pages/Home.vue';
// import Login from './pages/Login.vue';
// import Register from './pages/Register.vue';
// import CreateGame from './components/CreateGame.vue';
// import JoinGame from './components/JoinGame.vue';
// import GameBoard from './components/GameBoard.vue';
// import Transaction from './components/Transaction.vue';

// const routes = [
//   { path: '/', component: Hola },
// // { path: '/', component: Home },
//   // { path: '/login', component: Login },
//   // { path: '/register', component: Register },
//   // { path: '/inicio', component: Home },
//   // { path: '/create-game', component: CreateGame },
//   // { path: '/join-game', component: JoinGame },
//   // { path: '/partida/:codigo', component: GameBoard },
//   // { path: '/transaction/:codigo', component: Transaction },
// ];

// const router = createRouter({
//   history: createWebHistory(),
//   routes,
// });

// export default {
//   name: 'App',
//   setup() {
//     return { router };
//   },
// };
</script>

<style scoped>
.fondo {
  font-family: 'Luckiest Guy', cursive;
  background: url("./images/fondo.jpg") no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
}
</style>
