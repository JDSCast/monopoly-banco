<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <div class="container d-flex justify-content-center align-items-center p-3 m-5 rounded-pill shadow-lg red-bg text-white">
      <h1 class="text-center">Calles del Monopoly</h1>
    </div>

    <button type="button" class="btn fixed-bottom btn-warning mb-4 w-25 m-4 p-2 shadow-lg fs-4 fw-bold rounded-pill" @click="volverAPartida">
      Volver
    </button>

    <div v-for="prop in propiedades" :key="prop.id" class="card m-4 w-75">
      <div class="card-header text-center p-4" :style="{ backgroundColor: prop.color, color: 'white' }">
        <h3>{{ prop.nombre?.toUpperCase() || "Sin nombre" }}</h3>
      </div>

      <div class="card-body p-3 row">
        <ul class="list-unstyled mb-3 col-7">
          <li><strong>Renta base:</strong></li>
          <li><strong>Con set de color:</strong></li>
          <li><strong>Con <span class="text-success">🏠</span>:</strong></li>
          <li><strong>Con <span class="text-success">🏠🏠</span>:</strong></li>
          <li><strong>Con <span class="text-success">🏠🏠🏠</span>:</strong></li>
          <li><strong>Con <span class="text-success">🏠🏠🏠🏠</span>:</strong></li>
          <li><strong>Con <span class="text-danger">🏨</span>:</strong></li>
        </ul>

        <ul class="list-unstyled mb-3 col-5 text-end">
          <li><strong>M{{ prop.renta?.baseRenta || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.baseRenta * 2 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.casa1 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.casa2 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.casa3 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.casa4 || 0 }}</strong></li>
          <li><strong>M{{ prop.renta?.rentaHotel || 0 }}</strong></li>
        </ul>
      </div>

      <div class="row border-top" style="margin: 0;">
        <ul class="list-unstyled mb-3 col-7">
          <li><strong>Casa cuesta:</strong></li>
          <li><strong>Hotel cuesta:</strong></li>
          <li><strong>Precio:</strong></li>
        </ul>
        <ul class="list-unstyled mb-3 col-5 text-end">
          <li><strong>M{{ prop.costoEdificios }}</strong></li>
          <li><strong>M{{ prop.costoEdificios }}</strong></li>
          <li><strong>M{{ prop.precio }}</strong></li>
        </ul>
      </div>

      <div class="row border-top bg-danger bg-opacity-25" style="margin: 0;">
        <ul class="list-unstyled mb-3 col-6">
          <li><strong>Hipoteca:</strong></li>
          <li><strong>Deshipoteca:</strong></li>
        </ul>
        <ul class="list-unstyled mb-3 col-6 text-end">
          <li><strong>M{{ prop.hipoteca }}</strong></li>
          <li><strong>M{{ calcularDeshipoteca(prop.hipoteca) }}</strong></li>
        </ul>
      </div>

      <div class="row border-top p-3" style="margin: 0;">
        <div class="text-center">
          <strong>Propietario:</strong>
          <span v-if="prop.propietario && prop.propietario !== ''">{{ prop.propietario }}</span>
          <span v-else class="fst-italic">Sin propietario</span>
        </div>

        <div class="row text-end col">
          <button class="btn btn-success btn-sm me-2 m-3 p-2 fw-bold" @click="comprar(prop)" v-if="!prop.propietario">
            Comprar
          </button>

          <template v-else-if="prop.propietario === jugadorActual?.nombre">
            <template v-if="!prop.hipotecada">
              <button class="btn btn-primary btn-sm me-2 m-3 p-2" @click="manejarCasasHotel(prop)">
                Comprar edificios
              </button>
              <button
                class="btn btn-danger btn-sm me-2 m-3 p-2"
                @click="prop.nivelRenta === 'baseRenta' ? venderPropiedad(prop) : venderEdificio(prop)"
              >
                {{ prop.nivelRenta === 'baseRenta' ? "Vender propiedad" : "Vender edificio" }}
              </button>
            </template>
            <button class="btn btn-success btn-sm me-2 m-3 p-2" @click="Hipotecar(prop)">
              {{ prop.hipotecada ? "Deshipotecar" : "Hipotecar" }}
            </button>
          </template>

          <template v-else>
            <button class="btn btn-danger btn-sm me-2 m-3 p-2" @click="pagarRenta(prop)">
              Pagar Renta
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { obtenerPropiedades } from '../firebase/obtenerPropiedades.js';
import Swal from 'sweetalert2';
import { getFirestore, doc, updateDoc, onSnapshot, setDoc, getDocs, collection, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const route = useRoute();
const router = useRouter();
const propiedades = ref([]);
const codigo = route.params.codigo;
const db = getFirestore();
const auth = getAuth();
const user = auth.currentUser;
const jugadorActual = ref(null);

const volverAPartida = () => {
  router.push(`/cards/${codigo}`);
};

onMounted(async () => {
  const baseProps = await obtenerPropiedades();
  const refJugProp = collection(db, `partidas/${codigo}/jugadores_propiedades`);

  // Escuchar cambios en la colección jugadores_propiedades
  onSnapshot(refJugProp, (snapshot) => {
    const dataJugProp = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    propiedades.value = baseProps.map((prop) => {
      const encontrada = dataJugProp.find((p) => p.id === prop.id);
      return encontrada ? { ...prop, propietario: encontrada.jugadorNombre, hipotecada: encontrada.hipotecada, jugadorId: encontrada.jugadorId, nivelRenta: encontrada.nivelRenta } : prop;
    });
  });

  if (user && codigo) {
    const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, user.uid);
    onSnapshot(jugadorRef, (docSnap) => {
      if (docSnap.exists()) {
        jugadorActual.value = { uid: user.uid, ...docSnap.data() };
      }
    });
  }
});

const calcularDeshipoteca = (hipoteca) => {
  if (!hipoteca || isNaN(hipoteca)) return 0;
  return Math.round(hipoteca * 1.1);
};

const pagarRenta = async (prop) => {
  if (prop.hipotecada) {
    return Swal.fire("Propiedad hipotecada", "No se puede cobrar renta en una propiedad hipotecada.", "info");
  }

  const nivelRenta = prop.nivelRenta || "baseRenta";
  let renta = prop.renta?.[nivelRenta] || 0;

  // Verificar si el propietario tiene todas las propiedades del grupo
  const grupo = propiedades.value.filter((p) => p.grupo === prop.grupo);
  const grupoCompleto = grupo.every((p) => p.jugadorId === prop.jugadorId);

  if (grupoCompleto && nivelRenta === "baseRenta") {
    renta *= 2; // Duplicar la renta base si el grupo está completo
  }

  if (!jugadorActual.value || jugadorActual.value.saldo < renta) {
    return Swal.fire("Saldo insuficiente", "No tienes suficiente saldo para pagar la renta.", "error");
  }

  const pagadorRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
  const receptorRef = doc(db, `partidas/${codigo}/jugadores`, prop.jugadorId);
  const receptorSnap = await getDoc(receptorRef);

  if (!receptorSnap.exists()) {
    return Swal.fire("Error", "No se encontró al propietario.", "error");
  }

  const receptor = receptorSnap.data();
  const nuevoSaldoPagador = jugadorActual.value.saldo - renta;
  const nuevoSaldoReceptor = (receptor.saldo || 0) + renta;

  await updateDoc(pagadorRef, { saldo: nuevoSaldoPagador });
  await updateDoc(receptorRef, { saldo: nuevoSaldoReceptor });

  Swal.fire("¡Renta pagada!", `Has pagado M${renta} a ${receptor.nombre}`, "success");
};

const comprar = async (prop) => {
  if (!prop.propietario && jugadorActual.value) {
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
      try {
        const nuevoSaldo = jugadorActual.value.saldo - prop.precio;
        if (nuevoSaldo < 0) {
          return Swal.fire("Fondos insuficientes", "No tienes suficiente saldo para comprar esta propiedad.", "error");
        }

        const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
        await updateDoc(jugadorRef, { saldo: nuevoSaldo });

        const propiedadRef = doc(db, `partidas/${codigo}/jugadores_propiedades`, prop.id);
        await setDoc(propiedadRef, {
          id: prop.id,
          jugadorId: jugadorActual.value.uid,
          jugadorNombre: jugadorActual.value.nombre,
          nombre: prop.nombre,
          nivelRenta: "baseRenta",
          hipotecada: false
        });

        prop.propietario = jugadorActual.value.nombre || "Jugador 1";
        Swal.fire("¡Compra realizada!", `${prop.nombre} ahora es tuya.`, "success");
      } catch (error) {
        console.error("Error al registrar la compra:", error);
        Swal.fire("Error", "No se pudo registrar la compra.", "error");
      }
    }
  }
};

const hipotecarPropiedad = async (prop) => {
  if (!jugadorActual.value) return;

  const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
  const propiedadRef = doc(db, `partidas/${codigo}/jugadores_propiedades`, prop.id);

  const nuevoSaldo = jugadorActual.value.saldo + prop.hipoteca;

  await updateDoc(jugadorRef, { saldo: nuevoSaldo });
  await updateDoc(propiedadRef, { hipotecada: true });

  prop.hipotecada = true;
  jugadorActual.value.saldo = nuevoSaldo;

  Swal.fire("¡Hipoteca realizada!", `${prop.nombre} ahora está hipotecada.`, "success");
};

const deshipotecarPropiedad = async (prop) => {
  if (!jugadorActual.value) return;

  const costoDeshipoteca = calcularDeshipoteca(prop.hipoteca);
  if (jugadorActual.value.saldo < costoDeshipoteca) {
    return Swal.fire("Fondos insuficientes", "No tienes suficiente saldo para deshipotecar esta propiedad.", "error");
  }

  const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
  const propiedadRef = doc(db, `partidas/${codigo}/jugadores_propiedades`, prop.id);

  const nuevoSaldo = jugadorActual.value.saldo - costoDeshipoteca;

  await updateDoc(jugadorRef, { saldo: nuevoSaldo });
  await updateDoc(propiedadRef, { hipotecada: false });

  prop.hipotecada = false;
  jugadorActual.value.saldo = nuevoSaldo;

  Swal.fire("¡Deshipoteca realizada!", `${prop.nombre} ahora está deshipotecada.`, "success");
};

const Hipotecar = async (prop) => {
  const nivelActual = prop.nivelRenta || "baseRenta";

  if (nivelActual !== "baseRenta") {
    return Swal.fire({
      title: "No se puede hipotecar",
      text: "Debes vender todos los edificios antes de hipotecar esta propiedad.",
      icon: "warning",
    });
  }

  if (!prop.hipotecada) {
    const result = await Swal.fire({
      title: `¿Deseas hipotecar la propiedad ${prop.nombre}?`,
      text: `Estás seguro que deseas hipotecar ${prop.nombre} por un precio de M${prop.hipoteca}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Hipotecar",
    });

    if (result.isConfirmed) {
      await hipotecarPropiedad(prop);
    }
  } else {
    const result = await Swal.fire({
      title: `¿Deseas deshipotecar la propiedad ${prop.nombre}?`,
      text: `Estás seguro que deseas deshipotecar ${prop.nombre} por un precio de M${calcularDeshipoteca(prop.hipoteca)}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Pagar Hipoteca",
    });

    if (result.isConfirmed) {
      await deshipotecarPropiedad(prop);
    }
  }
};

const manejarCasasHotel = async (prop) => {
  if (!validarGrupoCompleto(prop)) {return} else{
    await mejorarRenta(prop);
  };

};

const validarGrupoCompleto = (prop) => {
  const grupo = propiedades.value.filter((p) => p.grupo === prop.grupo);
  const grupoCompleto = grupo.every((p) => p.jugadorId === jugadorActual.value.uid);

  if (!grupoCompleto) {
    const faltantes = grupo.filter((p) => p.jugadorId !== jugadorActual.value.uid).map((p) => p.nombre);
    Swal.fire({
      title: "¿Te faltan calles por comprar?",
      text: `Primero debes comprar las calles: ${faltantes.join(", ")} que te faltan!!`,
      icon: "warning",
    });
    return false;
  }

  const niveles = ["baseRenta", "casa1", "casa2", "casa3", "casa4", "rentaHotel"];
  const nivelActual = niveles.indexOf(prop.nivelRenta || "baseRenta");

  const nivelesGrupo = grupo.map((p) => niveles.indexOf(p.nivelRenta || "baseRenta"));
  const nivelMinimo = Math.min(...nivelesGrupo);
  const nivelMaximo = Math.max(...nivelesGrupo);

  if (nivelActual > nivelMinimo) {
    Swal.fire({
      title: "Niveles de renta desiguales",
      text: "Primero debes mejorar la renta de las otras propiedades del grupo, antes de avanzar al siguiente nivel.",
      icon: "warning",
    });
    return false;
  }

  if (nivelMaximo - nivelMinimo > 1) {
    Swal.fire({
      title: "Progreso desigual",
      text: "No puedes mejorar más la renta mientras las demás propiedades del grupo no estén al mismo nivel.",
      icon: "warning",
    });
    return false;
  }

  return true;
};

const mejorarRenta = async (prop) => {
  if (!validarGrupoCompleto(prop)) return;

  const nivelActual = prop.nivelRenta || "baseRenta";
  const niveles = ["baseRenta", "casa1", "casa2", "casa3", "casa4", "rentaHotel"];
  const indiceActual = niveles.indexOf(nivelActual);

  if (indiceActual === -1 || indiceActual === niveles.length - 1) {
    return Swal.fire("No se puede mejorar", "Ya alcanzaste el nivel máximo de renta.", "info");
  }

  const siguienteNivel = niveles[indiceActual + 1];
  const costo = prop.costoEdificios;

  if (jugadorActual.value.saldo < costo) {
    return Swal.fire("Fondos insuficientes", "No tienes suficiente saldo para mejorar la renta.", "error");
  }

  const result = await Swal.fire({
    title: `¿Mejorar renta?`,
    html: `
      <p>Compra más edificios (casas/hoteles) para mejorar la renta de la propiedad</p>
      <p><strong>Renta actual:</strong> M${prop.renta[nivelActual] * 2}</p>
      <p><strong>Si compras otro edificio:</strong style="color: green; font-weight: bold;"> Tu renta pasará a M${prop.renta[siguienteNivel]}.</p>
      <p><strong>Costo:</strong style="color: red;"> M${costo}</p>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    cancelButtonText: "Cancelar",
    confirmButtonText: "Comprar edificio",
  });

  if (result.isConfirmed) {
    const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
    const propiedadRef = doc(db, `partidas/${codigo}/jugadores_propiedades`, prop.id);

    const nuevoSaldo = jugadorActual.value.saldo - costo;

    await updateDoc(jugadorRef, { saldo: nuevoSaldo });
    await updateDoc(propiedadRef, { nivelRenta: siguienteNivel });

    prop.renta.nivelRenta = siguienteNivel;
    jugadorActual.value.saldo = nuevoSaldo;

    Swal.fire("¡Renta mejorada!", `${prop.nombre} ahora tiene una renta mayor.`, "success");
  }
};

const venderEdificio = async (prop) => {
  const niveles = ["baseRenta", "casa1", "casa2", "casa3", "casa4", "rentaHotel"];
  const nivelActual = prop.nivelRenta || "baseRenta";
  const indiceActual = niveles.indexOf(nivelActual);

  if (indiceActual <= 0) {
    return Swal.fire("No se puede vender", "No puedes vender más edificios, ya estás en el nivel base.", "info");
  }

  const nivelAnterior = niveles[indiceActual - 1];
  const ganancia = Math.floor(prop.costoEdificios / 2);

  const result = await Swal.fire({
    title: `¿Vender edificio?`,
    html: `
      <p>¿Estás seguro de que deseas vender un edificio de ${prop.nombre}?</p>
      <p><strong>Ganancia:</strong> M${ganancia}</p>
      <p><strong>Valor de renta después de la venta:</strong> M${prop.renta[nivelAnterior] * 2}</p>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    cancelButtonText: "Cancelar",
    confirmButtonText: "Vender edificio",
  });

  if (result.isConfirmed) {
    const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
    const propiedadRef = doc(db, `partidas/${codigo}/jugadores_propiedades`, prop.id);

    const nuevoSaldo = jugadorActual.value.saldo + ganancia;

    await updateDoc(jugadorRef, { saldo: nuevoSaldo });
    await updateDoc(propiedadRef, { nivelRenta: nivelAnterior });

    prop.nivelRenta = nivelAnterior;
    jugadorActual.value.saldo = nuevoSaldo;

    Swal.fire("¡Edificio vendido!", `Has vendido un edificio de ${prop.nombre}.`, "success");
  }
};

const venderPropiedad = async (prop) => {
  if (!jugadorActual.value) return;

  const result = await Swal.fire({
    title: `¿Vender propiedad?`,
    html: `
      <p>¿Estás seguro de que deseas vender la propiedad ${prop.nombre}?</p>
      <p><strong>Ganancia:</strong> M${Math.floor(prop.precio / 2)}</p>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    cancelButtonText: "Cancelar",
    confirmButtonText: "Vender propiedad",
  });

  if (result.isConfirmed) {
    const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
    const propiedadRef = doc(db, `partidas/${codigo}/jugadores_propiedades`, prop.id);

    const ganancia = Math.floor(prop.precio / 2);
    const nuevoSaldo = jugadorActual.value.saldo + ganancia;

    await updateDoc(jugadorRef, { saldo: nuevoSaldo });
    await updateDoc(propiedadRef, { jugadorId: null, jugadorNombre: null, hipotecada: false, nivelRenta: "baseRenta" });

    prop.propietario = null;
    prop.jugadorId = null;
    prop.hipotecada = false;
    prop.nivelRenta = "baseRenta";
    jugadorActual.value.saldo = nuevoSaldo;

    Swal.fire("¡Propiedad vendida!", `Has vendido ${prop.nombre}.`, "success");
  }
};
</script>

<style scoped>
.red-bg {
  background-color: #FF0000;
}
</style>