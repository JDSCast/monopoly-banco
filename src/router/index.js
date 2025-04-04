import { createRouter, createWebHistory } from 'vue-router';
import { getAuth } from 'firebase/auth';

// Importar componentes
import Main from '../pages/Main.vue';
import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Cards from '../pages/Cards.vue';
import Comercio from '../pages/Comercio.vue'
import CrearComercio from '../pages/CrearComercio.vue'

import CreateGame from '../components/CreateGame.vue';
import JoinGame from '../components/JoinGame.vue';
import GameBoard from '../components/GameBoard.vue';
import Transaction from '../components/Transaction.vue';
import Cardpropiedades from '../components/Cardpropiedas.vue';
import CardTrain from '../components/CardTrain.vue';
import CardServices from '../components/CardServices.vue'


const routes = [
  { path: '/', name: 'main', component: Main },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  { path: '/inicio', name: 'inicio', component: Home, meta: { requiresAuth: true } },
  { path: '/create-game', name: 'create-game', component: CreateGame, meta: { requiresAuth: true } },
  { path: '/join-game', name: 'join-game', component: JoinGame, meta: { requiresAuth: true } },
  { path: '/partida/:codigo', name: 'game-board', component: GameBoard, meta: { requiresAuth: true } },
  { path: '/transaction/:codigo', name: 'transaction', component: Transaction, meta: { requiresAuth: true } },

  //cartas
  { path: '/cards/:codigo', name: 'cards', component: Cards},
  { path: '/propiedades/:codigo', name: 'propiedades', component: Cardpropiedades },
  { path: '/estaciones/:codigo', name: 'estaciones', component: CardTrain },
  { path: '/servicios/:codigo', name: 'servicios', component: CardServices },

  //Rutas de comercio
  //9575
  { path: '/comercio/:codigo', name: 'MenuComercio', component: Comercio, meta: { requiresAuth: true } },
  { path: '/crearcomercio/:codigo', name: 'CrearComercio', component: CrearComercio, meta: { requiresAuth: true } },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const user = auth.currentUser; 

  if (requiresAuth && !user) {
    console.log("Acceso denegado. Redirigiendo a /login");
    next('/login');
  } else {
    next();
  }
});

export default router;
