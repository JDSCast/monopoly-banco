<template>
  <div class="container-transaction">
    <div class="card card-transaction">
      <div class="card-body card-body-transaction ">
        <form @submit.prevent="handleConfirmar">
          <h2 class="text-center">Transacciones</h2>

          <div class="row align-items-center">
            <div class="row align-items-center">
                <div class="col-md-4 info_usuario m-2 fs-5">
                  <label class="form-label">Usuario Actual: </label>
                  <p class="">{{ jugadorActual?.nombre || 'N/A' }}</p>
                </div>
              
                <div class="col-md-6 info_usuario  m-2 fs-5">
                  <label class="form-label">Saldo: </label>
                  <p class="">{{ jugadorActual?.saldo || 'N/A' }}</p>
                </div>
            </div>
            <div class="col-md-4 p-2">
              <label class="form-label">Monto</label>
              <input
                type="number"
                class="form-control"
                v-model="monto"
                min=1
              />
            </div>

            <div class="col-md-4 p-2">
              <label class="form-label">Tipo</label>
              <select class="form-select" v-model="tipo">
                <option value="enviar">Enviar dinero</option>
                <option value="cobrar">Cobrar del banco</option>
                <option value="pagar">Pagar al banco</option>
              </select>
            </div>

            <div class="col-md-4 p-2" v-if="tipo === 'enviar'">
              <label class="form-label">Destino</label>
              <select
                class="form-select"
                v-model="destino"
              >
                <option value="">Seleccionar jugador</option>
                <option v-for="j in partida?.jugadores.filter(j => j.uid !== usuarioActual?.uid && j.uid !== jugadorActual?.uid)" :key="j.uid" :value="j.uid">
                {{ j.nombre }}
                </option>
              </select>
            </div>
          </div>

          <br />

          <div class="text-center">
            <button type="submit" class="btn btn-success" :disabled="!isValidTransaction">Confirmar</button>
          </div>

          <br />

          <div class="text-center">
            <button
              type="button"
              class="btn btn-secondary"
              @click="volverAPartida"
            >
              Volver
            </button>
          </div>
          
        </form>
        <div class="border-top mt-3 p-2 historial">
              <h5 class="text-center">Historial de transacciones</h5>
              <div class="historial-container mb-1 " >
                <div class="list-group list-group-historial " style="max-height: 200px;">
                  <div
                    v-for="(t, index) in transacciones.slice().reverse()"
                    :key="index"
                    class="list-group-item list-group-item-historial d-flex justify-content-between mb-2 "
                  >
                    <div>
                      <h6 class="mb-1">
                        {{ t.tipo === 'enviar' || t.tipo === 'pagar'
                          ? `${t.origen} -> ${t.destino}`
                          : `${t.destino} -> ${t.origen}` }}
                      </h6>
                      <small class="text-muted">
                        {{ t.tipo === 'enviar'
                          ? 'Transferencia'
                          : t.tipo === 'cobrar'
                          ? 'Depósito del banco'
                          : 'Pago al banco' }}
                      </small>
                      <br />
                      <small class="text-muted">{{ t.fecha }}</small>
                    </div>
                    <span :class="['badge', t.tipo === 'enviar' || t.tipo === 'pagar' ? 'bg-danger' : 'bg-success']">
                      {{ t.tipo === 'enviar' || t.tipo === 'pagar' ? '- $' : '+ $' }}{{ Math.abs(t.monto) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getFirestore, doc, updateDoc, onSnapshot, collection, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Swal from 'sweetalert2';

export default {
  name: 'Transaction',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const db = getFirestore();
    const auth = getAuth();

    const codigo = route.params.codigo;
    const usuarioActual = auth.currentUser;
    const monto = ref("");
    const tipo = ref("enviar");
    const destino = ref("");
    const partida = ref(null);
    const transacciones = ref([]);
    const jugadorActual = ref(null);

    const isValidTransaction = computed(() => {
      if (tipo.value === "enviar") {
        return monto.value > 0 && destino.value && jugadorActual.value.saldo >= monto.value;
      }
      return monto.value > 0;
    });

    const validarMonto = () => {
      monto.value = monto.value.replace(/[^0-9]/g, "");
    };

    const fetchPartida = async () => {
      const jugadoresRef = collection(db, `partidas/${codigo}/jugadores`);
      const unsubJugadores = onSnapshot(jugadoresRef, (querySnapshot) => {
        const jugadores = querySnapshot.docs.map((doc) => doc.data());
        partida.value = { ...partida.value, jugadores };
        jugadorActual.value = jugadores.find((j) => j.uid === usuarioActual?.uid);
      });

      const transaccionesRef = collection(db, `partidas/${codigo}/transacciones`);
      const unsubTransacciones = onSnapshot(transaccionesRef, (querySnapshot) => {
        transacciones.value = querySnapshot.docs.map((doc) => doc.data());
      });

      return () => {
        unsubJugadores();
        unsubTransacciones();
      };
    };

    const handleConfirmar = async () => {
      if (!isValidTransaction.value) {
        Swal.fire({
          icon: "error",
          title: "Transacción no válida",
          text: "Revisa los campos e intenta de nuevo.",
          confirmButtonText: "OK",
        });
        return;
      }

      const montoNum = parseFloat(monto.value);
      let nuevaTransaccion = {
        id: Date.now(),
        origen: jugadorActual.value.nombre,
        destino: "",
        monto: montoNum,
        tipo: tipo.value,
        fecha: new Date().toLocaleString(),
      };

      if (tipo.value === "enviar") {
        const jugadorDestinoRef = doc(db, `partidas/${codigo}/jugadores`, destino.value);
        const jugadorDestinoSnap = await getDoc(jugadorDestinoRef);

        if (!jugadorDestinoSnap.exists()) {
          Swal.fire({
            icon: "error",
            title: "Transacción no válida",
            text: "El jugador destino no existe.",
            confirmButtonText: "OK",
          });
          return;
        }

        const jugadorDestino = jugadorDestinoSnap.data();

        if (jugadorActual.value.saldo < montoNum) {
          Swal.fire({
            icon: "error",
            title: "Saldo insuficiente",
            text: "No tienes suficiente dinero para esta transacción.",
            confirmButtonText: "OK",
          });
          return;
        }

        // Actualizar saldos
        const jugadorActualRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
        await updateDoc(jugadorActualRef, { saldo: jugadorActual.value.saldo - montoNum });

        await updateDoc(jugadorDestinoRef, { saldo: jugadorDestino.saldo + montoNum });

        nuevaTransaccion.destino = jugadorDestino.nombre;
      } else if (tipo.value === "cobrar") {
        const jugadorActualRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
        await updateDoc(jugadorActualRef, { saldo: jugadorActual.value.saldo + montoNum });

        nuevaTransaccion.destino = "Banco";
      } else if (tipo.value === "pagar") {
        if (jugadorActual.value.saldo < montoNum) {
          Swal.fire({
            icon: "error",
            title: "Saldo insuficiente",
            text: "No tienes suficiente dinero para esta transacción.",
            confirmButtonText: "OK",
          });
          return;
        }

        const jugadorActualRef = doc(db, `partidas/${codigo}/jugadores`, jugadorActual.value.uid);
        await updateDoc(jugadorActualRef, { saldo: jugadorActual.value.saldo - montoNum });

        nuevaTransaccion.destino = "Banco";
      }

      // Añadir la transacción a la subcolección "transacciones"
      const transaccionesRef = collection(db, `partidas/${codigo}/transacciones`);
      const nuevaTransaccionRef = doc(transaccionesRef, nuevaTransaccion.id.toString());
      await setDoc(nuevaTransaccionRef, nuevaTransaccion);

      monto.value = "";
      destino.value = "";
      Swal.fire({
        icon: "success",
        title: "Transacción realizada",
        text: "La transacción se ha realizado con éxito.",
        confirmButtonText: "OK",
      });
      router.push(`/partida/${codigo}`);
    };

    const volverAPartida = () => {
      router.push(`/partida/${codigo}`);
    };

    onMounted(() => {
      if (codigo) fetchPartida();
    });

    return {
      monto,
      tipo,
      destino,
      partida,
      transacciones,
      jugadorActual,
      handleConfirmar,
      isValidTransaction,
      volverAPartida,
      validarMonto
    };
  },
};
</script>

<style scoped>
@import "../styles/transaction.css";

.info_usuario{
  width: 180px;
  border-bottom: 1px solid rgb(0, 148, 66);
}

.historial{
  height: 250px;
}
</style>
