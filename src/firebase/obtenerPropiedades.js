import { db } from "./config.js";
import { collection, getDocs } from "firebase/firestore";

// 🔁 Función reutilizable
const obtenerPorTipo = async (tipo) => {
  try {
    const snapshot = await getDocs(collection(db, "propiedades"));

    const propiedades = await Promise.all(
      snapshot.docs
        .filter((doc) => doc.data().tipo === tipo)
        .map(async (doc) => {
          const data = { id: doc.id, ...doc.data() };

          const rentaSnap = await getDocs(collection(doc.ref, "renta"));
          let renta = {};
          rentaSnap.forEach((rentaDoc) => {
            renta = rentaDoc.data(); // usualmente es solo uno
          });

          return { ...data, renta };
        })
    );

    return propiedades;
  } catch (error) {
    console.error(`❌ Error al obtener propiedades tipo "${tipo}":`, error);
    return [];
  }
};

// ✅ Obtener solo tipo "calle"
export const obtenerPropiedades = async () => {
  return await obtenerPorTipo("calle");
};

// ✅ Obtener solo tipo "estacion"
export const obtenerEstaciones = async () => {
  return await obtenerPorTipo("estacion");
};

// ✅ Obtener solo tipo "servicio"
export const obtenerServicios = async () => {
  return await obtenerPorTipo("servicio");
};

// 🧠 Opcional: si necesitas todos los tipos de golpe
export const obtenerTodasLasPropiedades = async () => {
  try {
    const snapshot = await getDocs(collection(db, "propiedades"));

    const propiedades = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = { id: doc.id, ...doc.data() };

        const rentaSnap = await getDocs(collection(doc.ref, "renta"));
        let renta = {};
        rentaSnap.forEach((rentaDoc) => {
          renta = rentaDoc.data();
        });

        return { ...data, renta };
      })
    );

    return propiedades;
  } catch (error) {
    console.error("❌ Error al obtener todas las propiedades:", error);
    return [];
  }
};
