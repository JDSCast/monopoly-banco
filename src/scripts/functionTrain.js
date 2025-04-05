import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { obtenerEstaciones } from "../firebase/obtenerPropiedades";
import { registrarTransaccion } from "../firebase/verTransaciones"; // ✅ IMPORTAR FUNCION
import Swal from "sweetalert2";
import { getFirestore, doc, updateDoc, setDoc, getDocs, collection, getDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export function useFunctionTrain() {
const route = useRoute();
const router = useRouter();
const codigo = route.params.codigo;
const db = getFirestore();
const auth = getAuth();
const user = auth.currentUser;

const estaciones = ref([]);
const jugadorActual = ref(null);

const volverAPartida = () => {
  router.push(`/cards/${codigo}`);
};

const calcularDeshipoteca = (hipoteca) => {
  if (!hipoteca || isNaN(hipoteca)) return 0;
  return Math.round(hipoteca * 1.1);
};

onMounted(async () => {
  const baseEstaciones = await obtenerEstaciones();
  const refJugProp = collection(db, `partidas/${codigo}/jugadores_propiedades`);
  const snap = await getDocs(refJugProp);
  const dataJugProp = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  estaciones.value = baseEstaciones
    .filter((e) => e.tipo === "estacion")
    .map((estacion) => {
      const encontrada = dataJugProp.find((p) => p.id === estacion.id);
      return encontrada
        ? { ...estacion, propietario: encontrada.jugadorNombre, hipotecada: encontrada.hipotecada, jugadorId: encontrada.jugadorId }
        : estacion;
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

const comprar = async (estacion) => {
  if (!estacion.propietario && jugadorActual.value) {
    const result = await Swal.fire({
      title: `¿Deseas comprar ${estacion.nombre}?`,
      text: `Precio: M${estacion.precio}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Comprar"
    });

    if (result.isConfirmed) {
      if (jugadorActual.value.saldo < estacion.precio) {
        return Swal.fire("Fondos insuficientes", "No tienes suficiente saldo.", "error");
      }

      const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
      await updateDoc(jugadorRef, { saldo: jugadorActual.value.saldo - estacion.precio });

      await setDoc(doc(db, `partidas/${codigo}/jugadores_propiedades`, estacion.id), {
        id: estacion.id,
        jugadorId: jugadorActual.value.uid,
        jugadorNombre: jugadorActual.value.nombre,
        nombre: estacion.nombre,
        nivelRenta: "baseRenta",
        hipotecada: false
      });

      estacion.propietario = jugadorActual.value.nombre;
      estacion.jugadorId = jugadorActual.value.uid;
      estacion.hipotecada = false;

      // ✅ Registrar la compra como transacción
      await registrarTransaccion(codigo, jugadorActual.value.nombre, "Banco", estacion.precio, "pagar");

      Swal.fire("¡Compra realizada!", `${estacion.nombre} ahora es tuya.`, "success");
    }
  }
};

const Hipotecar = async (estacion) => {
  const estacionRef = doc(db, `partidas/${codigo}/jugadores_propiedades`, estacion.id);

  if (!estacion.hipotecada) {
    const result = await Swal.fire({
      title: `¿Deseas hipotecar ${estacion.nombre}?`,
      text: `Recibirás M${estacion.hipoteca}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hipotecar"
    });

    if (result.isConfirmed) {
      estacion.hipotecada = true;
      await updateDoc(estacionRef, { hipotecada: true });

      const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, estacion.jugadorId);
      const jugadorSnap = await getDoc(jugadorRef);
      if (jugadorSnap.exists()) {
        const jugador = jugadorSnap.data();
        await updateDoc(jugadorRef, { saldo: jugador.saldo + estacion.hipoteca });
      }

      // ✅ Registrar hipoteca como transacción
      await registrarTransaccion(codigo, "Banco", jugadorActual.value.nombre, estacion.hipoteca, "cobrar");

      Swal.fire("¡Hecho!", `${estacion.nombre} ahora está hipotecada.`, "success");
    }
  } else {
    const costo = calcularDeshipoteca(estacion.hipoteca);

    const result = await Swal.fire({
      title: `¿Deseas deshipotecar ${estacion.nombre}?`,
      text: `Costará M${costo}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Pagar"
    });

    if (result.isConfirmed) {
      estacion.hipotecada = false;
      await updateDoc(estacionRef, { hipotecada: false });

      const jugadorRef = doc(db, `partidas/${codigo}/jugadores`, estacion.jugadorId);
      const jugadorSnap = await getDoc(jugadorRef);
      if (jugadorSnap.exists()) {
        const jugador = jugadorSnap.data();
        await updateDoc(jugadorRef, { saldo: jugador.saldo - costo });
      }

      // ✅ Registrar deshipoteca como transacción
      await registrarTransaccion(codigo, jugadorActual.value.nombre, "Banco", costo, "pagar");

      Swal.fire("¡Hecho!", `${estacion.nombre} ya no está hipotecada.`, "success");
    }
  }
};

const pagarRenta = async (estacion) => {
  if (!jugadorActual.value) return;

  const refJugadores = collection(db, `partidas/${codigo}/jugadores`);
  const receptorRef = doc(refJugadores, estacion.jugadorId);
  const pagadorRef = doc(refJugadores, jugadorActual.value.uid);

  const receptorSnap = await getDoc(receptorRef);
  if (!receptorSnap.exists()) {
    return Swal.fire("Error", "No se encontró al propietario.", "error");
  }

  const receptor = receptorSnap.data();

  const estacionesPropietario = estaciones.value.filter(
    (e) => e.tipo === "estacion" && e.propietario === estacion.propietario && !e.hipotecada
  );

  let renta = 0;
  const cantidad = estacionesPropietario.length;

  if (cantidad === 1) renta = 25;
  else if (cantidad === 2) renta = 50;
  else if (cantidad === 3) renta = 100;
  else if (cantidad === 4) renta = 200;

  if (jugadorActual.value.saldo < renta) {
    return Swal.fire("Saldo insuficiente", "No puedes pagar la renta.", "error");
  }

  await updateDoc(pagadorRef, { saldo: jugadorActual.value.saldo - renta });
  await updateDoc(receptorRef, { saldo: receptor.saldo + renta });

  // ✅ Registrar el pago de renta como transacción
  await registrarTransaccion(codigo, jugadorActual.value.nombre, receptor.nombre, renta, "enviar");

  Swal.fire("¡Renta pagada!", `Pagaste M${renta} a ${receptor.nombre}`, "success");
};

  return {
    estaciones,
    jugadorActual,
    volverAPartida,
    comprar,
    Hipotecar,
    pagarRenta,
    calcularDeshipoteca
  }
};
