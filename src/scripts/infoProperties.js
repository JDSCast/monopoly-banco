// Importar Firebase y Firestore
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
// Keys o .env de FireBase
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const propiedades = [
  {
    nombre: "Mediterranean Avenue",
    color: "#915032",
    precio: 60,
    costoEdificios: 50,
    hipoteca: 30,
    grupo: "Marrón",
    tipo: "propiedad",
    baseRenta: 2,
    casa1: 10,
    casa2: 30,
    casa3: 90,
    casa4: 160,
    rentaHotel: 250
  },
  {
    nombre: "Baltic Avenue",
    color: "#915032",
    precio: 60,
    costoEdificios: 50,
    hipoteca: 30,
    grupo: "Marrón",
    tipo: "propiedad",
    baseRenta: 4,
    casa1: 20,
    casa2: 60,
    casa3: 180,
    casa4: 320,
    rentaHotel: 450
  },
  {
    nombre: "Oriental Avenue",
    color: "#aadcfa",
    precio: 100,
    costoEdificios: 50,
    hipoteca: 50,
    grupo: "Rosa",
    tipo: "propiedad",
    baseRenta: 6,
    casa1: 30,
    casa2: 90,
    casa3: 270,
    casa4: 400,
    rentaHotel: 550
  },
  {
    nombre: "Vermont Avenue",
    color: "#aadcfa",
    precio: 100,
    costoEdificios: 50,
    hipoteca: 50,
    grupo: "Rosa",
    tipo: "propiedad",
    baseRenta: 6,
    casa1: 30,
    casa2: 90,
    casa3: 270,
    casa4: 400,
    rentaHotel: 550
  },
  {
    nombre: "Connecticut Avenue",
    color: "#aadcfa",
    precio: 120,
    costoEdificios: 50,
    hipoteca: 60,
    grupo: "Rosa",
    tipo: "propiedad",
    baseRenta: 8,
    casa1: 40,
    casa2: 100,
    casa3: 300,
    casa4: 450,
    rentaHotel: 600
  },
  {
    nombre: "St. Charles Place",
    color: "#d73796",
    precio: 140,
    costoEdificios: 100,
    hipoteca: 70,
    grupo: "Morado",
    tipo: "propiedad",
    baseRenta: 10,
    casa1: 50,
    casa2: 150,
    casa3: 450,
    casa4: 625,
    rentaHotel: 750
  },
  {
    nombre: "States Avenue",
    color: "#d73796",
    precio: 140,
    costoEdificios: 100,
    hipoteca: 70,
    grupo: "Morado",
    tipo: "propiedad",
    baseRenta: 10,
    casa1: 50,
    casa2: 150,
    casa3: 450,
    casa4: 625,
    rentaHotel: 750
  },
  {
    nombre: "Virginia Avenue",
    color: "#d73796",
    precio: 160,
    costoEdificios: 100,
    hipoteca: 80,
    grupo: "Morado",
    tipo: "propiedad",
    baseRenta: 12,
    casa1: 60,
    casa2: 180,
    casa3: 500,
    casa4: 700,
    rentaHotel: 900
  },
  {
    nombre: "St. James Place",
    color: "#f59119",
    precio: 180,
    costoEdificios: 100,
    hipoteca: 90,
    grupo: "Naranja",
    tipo: "propiedad",
    baseRenta: 14,
    casa1: 70,
    casa2: 200,
    casa3: 550,
    casa4: 750,
    rentaHotel: 950
  },
  {
    nombre: "Tennessee Avenue",
    color: "#f59119",
    precio: 180,
    costoEdificios: 100,
    hipoteca: 90,
    grupo: "Naranja",
    tipo: "propiedad",
    baseRenta: 14,
    casa1: 70,
    casa2: 200,
    casa3: 550,
    casa4: 750,
    rentaHotel: 950
  },
  {
    nombre: "New York Avenue",
    color: "#f59119",
    precio: 200,
    costoEdificios: 100,
    hipoteca: 100,
    grupo: "Naranja",
    tipo: "propiedad",
    baseRenta: 16,
    casa1: 80,
    casa2: 220,
    casa3: 600,
    casa4: 800,
    rentaHotel: 1000
  },
  {
    nombre: "Kentucky Avenue",
    color: "#f01923",
    precio: 220,
    costoEdificios: 150,
    hipoteca: 110,
    grupo: "Rojo",
    tipo: "propiedad",
    baseRenta: 18,
    casa1: 90,
    casa2: 250,
    casa3: 700,
    casa4: 875,
    rentaHotel: 1050
  },
  {
    nombre: "Indiana Avenue",
    color: "#f01923",
    precio: 220,
    costoEdificios: 150,
    hipoteca: 110,
    grupo: "Rojo",
    tipo: "propiedad",
    baseRenta: 18,
    casa1: 90,
    casa2: 250,
    casa3: 700,
    casa4: 875,
    rentaHotel: 1050
  },
  {
    nombre: "Illinois Avenue",
    color: "#f01923",
    precio: 240,
    costoEdificios: 150,
    hipoteca: 120,
    grupo: "Rojo",
    tipo: "propiedad",
    baseRenta: 20,
    casa1: 100,
    casa2: 300,
    casa3: 750,
    casa4: 925,
    rentaHotel: 1100
  },
  {
    nombre: "Atlantic Avenue",
    color: "#faf000",
    precio: 260,
    costoEdificios: 150,
    hipoteca: 130,
    grupo: "Amarillo",
    tipo: "propiedad",
    baseRenta: 22,
    casa1: 110,
    casa2: 330,
    casa3: 800,
    casa4: 975,
    rentaHotel: 1150
  },
  {
    nombre: "Ventnor Avenue",
    color: "#faf000",
    precio: 260,
    costoEdificios: 150,
    hipoteca: 130,
    grupo: "Amarillo",
    tipo: "propiedad",
    baseRenta: 22,
    casa1: 110,
    casa2: 330,
    casa3: 800,
    casa4: 975,
    rentaHotel: 1150
  },
  {
    nombre: "Marvin Gardens",
    color: "#faf000",
    precio: 280,
    costoEdificios: 150,
    hipoteca: 140,
    grupo: "Amarillo",
    tipo: "propiedad",
    baseRenta: 24,
    casa1: 120,
    casa2: 360,
    casa3: 850,
    casa4: 1025,
    rentaHotel: 1200
  },
  {
    nombre: "Pacific Avenue",
    color: "#1eaf5a",
    precio: 300,
    costoEdificios: 200,
    hipoteca: 150,
    grupo: "Verde",
    tipo: "propiedad",
    baseRenta: 26,
    casa1: 130,
    casa2: 390,
    casa3: 900,
    casa4: 1100,
    rentaHotel: 1275
  },
  {
    nombre: "North Carolina Avenue",
    color: "#1eaf5a",
    precio: 300,
    costoEdificios: 200,
    hipoteca: 150,
    grupo: "Verde",
    tipo: "propiedad",
    baseRenta: 26,
    casa1: 130,
    casa2: 390,
    casa3: 900,
    casa4: 1100,
    rentaHotel: 1275
  },
  {
    nombre: "Pennsylvania Avenue",
    color: "#1eaf5a",
    precio: 320,
    costoEdificios: 200,
    hipoteca: 160,
    grupo: "Verde",
    tipo: "propiedad",
    baseRenta: 28,
    casa1: 150,
    casa2: 450,
    casa3: 1000,
    casa4: 1200,
    rentaHotel: 1400
  },
  {
    nombre: "Park Plaza",
    color: "#006eb9",
    precio: 350,
    costoEdificios: 200,
    hipoteca: 175,
    grupo: "Azul",
    tipo: "propiedad",
    baseRenta: 35,
    casa1: 175,
    casa2: 500,
    casa3: 1100,
    casa4: 1300,
    rentaHotel: 1500
  },
  {
    nombre: "Boardwalk",
    color: "#006eb9",
    precio: 400,
    costoEdificios: 200,
    hipoteca: 200,
    grupo: "Azul",
    tipo: "propiedad",
    baseRenta: 50,
    casa1: 200,
    casa2: 600,
    casa3: 1400,
    casa4: 1700,
    rentaHotel: 2000
  }
];

// Función para subir las propiedades a Firestore
const subirPropiedades = async () => {
  try {
    const refPropiedades = collection(db, "propiedades");

    for (const propiedad of propiedades) {
      console.log("Subiendo propiedad:", propiedad.nombre);

      const { baseRenta, casa1, casa2, casa3, casa4, rentaHotel, ...restoDatos } = propiedad;

      // Subir documento principal con color y demás campos
      const docRef = await addDoc(refPropiedades, restoDatos);

      // Subcolección "renta" (sin color)
      const subRefRenta = collection(docRef, "renta");
      await addDoc(subRefRenta, { baseRenta, casa1, casa2, casa3, casa4, rentaHotel });

      console.log(`Propiedad "${propiedad.nombre}" subida con subcolección "renta"`);
    }

    console.log("¡Todas las propiedades fueron subidas correctamente!");
  } catch (error) {
    console.error("Error al subir propiedades:", error);
  }
};


subirPropiedades();
