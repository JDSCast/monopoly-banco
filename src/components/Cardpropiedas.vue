<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <div class="container d-flex justify-content-center align-items-center p-3 m-5 rounded-pill shadow-lg red-bg text-white">
      <h1 class="text-center">Calles del Monopoly</h1>
    </div>

    <button type="button" class="btn fixed-bottom btn-warning mb-4 w-25 m-4 p-2 shadow-lg fs-4 fw-bold rounded-pill" @click="volverAPartida">
      Volver
    </button>

    <div v-for="prop in propiedades" :key="prop.id" class="card m-4 w-75">
      <div class="all-card text-center p-4" :style="{ backgroundColor: prop.color, color: 'white' }">
        <div class="title-card">
          <h3 class="text-title">{{ prop.nombre?.toUpperCase() || "Sin nombre" }}</h3>
        </div>
        <div class="price-card">
          <div class="center-card">
            <h5 class="text-subtitle">precio:</h5>
            <h4 class="text-subtitle"><strong>M{{ prop.precio }}</strong></h4>
          </div>
        </div>
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
        </ul>
        <ul class="list-unstyled mb-3 col-5 text-end">
          <li><strong>M{{ prop.costoEdificios }}</strong></li>
          <li><strong>M{{ prop.costoEdificios }}</strong></li>
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
              <button v-if="prop.nivelRenta !== 'baseRenta'" class="btn btn-danger btn-sm me-2 m-3 p-2" @click="venderEdificio(prop)" >
                Vender edificio
              </button>

            </template>
            <button class="btn btn-success btn-sm me-2 m-3 p-2" @click="Hipotecar(prop)">
              {{ prop.hipotecada ? "Deshipotecar" : "Hipotecar" }}
            </button>
          </template>

          <template v-else>
            <button class="btn btn-danger btn-sm me-2 m-3 p-2 fw-bold" @click="pagarRenta(prop)"v-if="!prop.hipotecada">    
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
import { registrarTransaccion } from "../firebase/verTransaciones";

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

    // Ordenamos primero por precio y luego por color
    propiedades.value.sort((a, b) => {
      // Primero comparamos por precio (de menor a mayor)
      const precioComparison = a.precio - b.precio;
      if (precioComparison !== 0) {
        return precioComparison;
      }
      // Si los precios son iguales, comparamos por color
      return a.color.localeCompare(b.color);
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
  await registrarTransaccion(codigo, jugadorActual.value.nombre, receptor.nombre, renta, "enviar");
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
        await registrarTransaccion(codigo, jugadorActual.value.nombre, "Banco", prop.precio, "pagar");
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


  await registrarTransaccion(codigo, "Banco", jugadorActual.value.nombre, prop.hipoteca, "cobrar");

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

  await registrarTransaccion(codigo, jugadorActual.value.nombre, "Banco", costoDeshipoteca, "pagar");

  Swal.fire("¡Deshipoteca realizada!", `${prop.nombre} ahora está deshipotecada.`, "success");
};
// ahi se trabajan las alertas  de hipotecar no borrar por que ya no sirve el boton
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
      <p><strong>Renta actual:</strong> M${nivelActual === "baseRenta"? prop.renta[nivelActual] * 2 : prop.renta[nivelActual]}</p>
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
    await registrarTransaccion(codigo, jugadorActual.value.nombre, "Banco", prop.costoEdificios, "pagar");
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
  const ganancia = Math.floor(prop.costoEdificios / 2); // ✅ La ganancia es la mitad del costoEdificios

  const result = await Swal.fire({
    title: `¿Vender edificio?`,
    html: `
      <p>¿Estás seguro de que deseas vender un edificio de <strong>${prop.nombre}</strong>?</p>
      <p><strong>Ganancia:</strong> M${ganancia}</p>
      <p><strong>Valor de renta después de la venta:</strong> M${nivelAnterior === "baseRenta" ? prop.renta[nivelAnterior] * 2 : prop.renta[nivelAnterior]}</p> <!-- ✅ Interpolación corregida -->
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

    // ✅ Guardar la venta en historial de movimientos
    await registrarTransaccion(codigo, "Banco", jugadorActual.value.nombre, ganancia, "cobrar");

    Swal.fire("¡Edificio vendido!", `Has vendido un edificio de ${prop.nombre}.`, "success");
  }
};



</script>

<style scoped>
.red-bg {
  background-color: #FF0000;
}
.all-card {
  display: flex;
  width: 100%;
  flex-direction: row;
}
.title-card {
  display: flex;
  justify-content: center;
  text-align: center;
  flex: 1;
  width: 70%;
}
.text-title{
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  text-align: center;
}
.price-card {
  display: flex;
  margin: 5px;
  flex: 1;
  width: 20%;
  flex-direction: column;
  justify-content: flex-end;
  text-align: flex-end;
}
.center-card{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}
.text-subtitle{
  display: flex;
  align-items: center;
  justify-content: center;
  height: 45%;
  width: 30%;
  text-align: center;
}

/* Estilo para los títulos de grupo de colores */
h3.text-center {
  padding: 10px;
  border-bottom: 2px solid currentColor;
  display: inline-block;
  margin-bottom: 20px;
  font-weight: bold;
}
</style>