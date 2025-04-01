<template>
    <div class="container-inicio">
      <div class="card card-inicio">
        <div class="card-body card-body-inicio">
          <h2 class="text-center">Monopoly</h2>
          <p>Bienvenido al juego de Monopoly</p>
          <div class="d-grid gap-2">
            <button class="btn btn-primary" @click="$router.push('/login')">Logearse</button>
            <button class="btn btn-secondary" @click="$router.push('/register')">Registrarse</button>
          </div>
        </div>
      </div>
    </div>
</template>
<style scoped>
    @import "../styles/home.css";
</style>