import { db } from "./config.js";
import { collection, getDocs } from "firebase/firestore";

export const obtenerPropiedades = async () => {
  try {
    const snapshot = await getDocs(collection(db, "propiedades"));

    const propiedades = await Promise.all(
      snapshot.docs
        .filter((doc) => doc.data().tipo === "calle") // Filtrar solo propiedades tipo "calle"
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
    console.error("❌ Error al obtener propiedades:", error);
    return [];
  }
};

export const obtenerEstaciones = async () => {
  const estaciones = [];
  const querySnapshot = await getDocs(collection(db, "propiedades"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.tipo === "estacion") {
      estaciones.push({ id: doc.id, ...data });
    }
  });
  return estaciones;
};
