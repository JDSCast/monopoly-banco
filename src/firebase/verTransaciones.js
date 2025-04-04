// src/firebase/verTransacciones.js
import { db } from "./config.js";
import { collection, doc, setDoc } from "firebase/firestore";

/**
 * Registra una transacción en la partida activa
 * @param {string} codigo Código de la partida
 * @param {string} origen Nombre del jugador que envía o paga
 * @param {string} destino Nombre del jugador que recibe o "Banco"
 * @param {number} monto Monto de dinero de la transacción
 * @param {string} tipo Tipo de transacción ("enviar", "pagar", "cobrar")
 */
export const registrarTransaccion = async (codigo, origen, destino, monto, tipo) => {
  if (!codigo || !origen || !destino || !monto || !tipo) {
    console.error("Faltan datos para registrar la transacción");
    return;
  }

  const transaccionesRef = collection(db, `partidas/${codigo}/transacciones`);
  const nuevaTransaccion = {
    id: Date.now(),
    origen,
    destino,
    monto,
    tipo,
    fecha: new Date().toLocaleString(),
  };
  
  const nuevaTransaccionRef = doc(transaccionesRef, nuevaTransaccion.id.toString());
  await setDoc(nuevaTransaccionRef, nuevaTransaccion);
};
