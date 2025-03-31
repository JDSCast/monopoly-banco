
import { createRouter, createWebHistory } from 'vue-router';

// import Hola from '../components/Hola.vue';

import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import CreateGame from '../components/CreateGame.vue';
import JoinGame from '../components/JoinGame.vue';
import GameBoard from '../components/GameBoard.vue';
import Transaction from '../components/Transaction.vue';


const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  { path: '/inicio', name: 'inicio', component: Home },
  { path: '/create-game', name: 'create-game', component: CreateGame },
  { path: '/join-game', name: 'join-game', component: JoinGame },
  { path: '/partida/:codigo', name: 'game-board', component: GameBoard },
  { path: '/transaction/:codigo', name: 'transaction', component: Transaction },
];


const router = createRouter({
  
  history: createWebHistory(),
  routes,
});

export default router;

