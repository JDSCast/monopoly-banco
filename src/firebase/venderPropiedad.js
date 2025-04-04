import { db } from "./config.js";
import { collection, getDocs } from "firebase/firestore";
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