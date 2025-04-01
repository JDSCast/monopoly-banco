<template>
  <div class="container-transaction">
    <div class="card card-transaction">
      <div class="card-body card-body-transaction">
        <form @submit.prevent="handleConfirmar">
          <h4 class="text-center">Transacciones</h4>

          <div class="row align-items-center">
            <div class="col-md-6">
              <label class="form-label">Usuario Actual: </label>
              <p class="form-control-plaintext">{{ jugadorActual?.nombre || 'N/A' }}</p>
            </div>

            <div class="col-md-6">
              <label class="form-label">Saldo: </label>
              <p class="form-control-plaintext">{{ jugadorActual?.saldo || 'N/A' }}</p>
            </div>

            <div class="col-md-4">
              <label class="form-label">Monto</label>
              <input
                type="number"
                class="form-control"
                v-model="monto"
              />
            </div>

            <div class="col-md-4">
              <label class="form-label">Tipo</label>
              <select class="form-select" v-model="tipo">
                <option value="enviar">Enviar dinero</option>
                <option value="cobrar">Cobrar del banco</option>
                <option value="pagar">Pagar al banco</option>
              </select>
            </div>

            <div class="col-md-4" v-if="tipo === 'enviar'">
              <label class="form-label">Destino</label>
              <select
                class="form-select"
                v-model="destino"
              >
                <option value="">Seleccionar jugador</option>
                <option v-for="j in partida?.jugadores.filter(j => j.uid !== usuarioActual?.uid)" :key="j.uid" :value="j.uid">
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
        <div class="border-top pt-3 p-0">
              <h5 class="text-center">Historial de transacciones</h5>
              <div class="historial-container">
                <div class="list-group list-group-historial">
                  <div
                    v-for="(t, index) in transacciones.slice().reverse()"
                    :key="index"
                    class="list-group-item list-group-item-historial d-flex justify-content-between"
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
import { getFirestore, doc, updateDoc, onSnapshot } from 'firebase/firestore';
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

    const fetchPartida = () => {
      const partidaRef = doc(db, "partidas", codigo);
      const unsub = onSnapshot(partidaRef, (docSnap) => {
        if (docSnap.exists()) {
          const partidaData = docSnap.data();
          partida.value = partidaData;
          transacciones.value = partidaData.transacciones || [];

          jugadorActual.value = partidaData.jugadores.find(
            (j) => j.uid === usuarioActual?.uid
          );
        }
      });
      return unsub;
    };

    const handleConfirmar = async () => {
      if (!isValidTransaction.value) {
        Swal.fire({
        icon: 'error',
        title: 'Transacción no válida',
        text: 'Revisa los campos e intenta de nuevo.',
        confirmButtonText: 'OK'
      });
      //toast.error("Transacción no válida.", { autoClose: 3000 });
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
        const jugadorDestino = partida.value?.jugadores.find(j => j.uid === destino.value);
        if (!jugadorDestino) {
          Swal.fire({
          icon: 'error',
          title: 'Transacción no válida',
          text: 'Revisa los campos e intenta de nuevo.',
          confirmButtonText: 'OK'
        });
  //toast.error("Seleccione un destino válido.", { autoClose: 3000 });
          return;
        }

        if (jugadorActual.value.saldo < montoNum) {
          Swal.fire({
          icon: 'error',
          title: 'Saldo insuficiente',
          text: 'No tienes suficiente dinero para esta transacción.',
          confirmButtonText: 'OK'
          });
          //toast.error("Saldo insuficiente.", { autoClose: 3000 });
          return;
        }
        jugadorActual.value.saldo -= montoNum;
        jugadorDestino.saldo += montoNum;
        nuevaTransaccion.destino = jugadorDestino.nombre;
      } else if (tipo.value === "cobrar") {
        jugadorActual.value.saldo += montoNum;
        nuevaTransaccion.destino = "Banco";
      } else if (tipo.value === "pagar") {
        if (jugadorActual.value.saldo < montoNum) {
          toast.error("Saldo insuficiente para pagar al banco.", { autoClose: 3000 });
          return;
        }
        jugadorActual.value.saldo -= montoNum;
        nuevaTransaccion.destino = "Banco";
      }
      const jugadoresDisponibles = computed(() => {
      return partida.value?.jugadores.filter(j => j.uid !== jugadorActual.value?.uid) || [];
      });

      const partidaRef = doc(db, "partidas", codigo);
      await updateDoc(partidaRef, {
        jugadores: partida.value.jugadores,
        transacciones: [...transacciones.value, nuevaTransaccion],
      });

      monto.value = "";
      destino.value = "";
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
    };
  },
};
</script>

  <style scoped>
@import "../styles/transaction.css";
  </style>
  