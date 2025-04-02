import { db } from './config';
import { collection, doc, getDocs, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

class FerrocarrilService {
  constructor() {
    this.estaciones = []; // Cache local de estaciones
  }

  // ==================== INICIALIZACI脫N ==================== //

  /**
   * Inicializa las 4 estaciones est谩ndar en Firestore
   * @param {string} gameId - ID del juego
   */
  async initializeStations(gameId) {
    const defaultStations = [
      {
        nombre: 'Reading Railroad',
        precio: 200,
        hipoteca: 100,
        propietario: null,
        hipotecada: false,
        tipo: 'ferrocarril',
        orden: 1,
        createdAt: serverTimestamp()
      },
      {
        nombre: 'Pennsylvania Railroad',
        precio: 200,
        hipoteca: 100,
        propietario: null,
        hipotecada: false,
        tipo: 'ferrocarril',
        orden: 2,
        createdAt: serverTimestamp()
      },
      {
        nombre: 'B. & O. Railroad',
        precio: 200,
        hipoteca: 100,
        propietario: null,
        hipotecada: false,
        tipo: 'ferrocarril',
        orden: 3,
        createdAt: serverTimestamp()
      },
      {
        nombre: 'Short Line',
        precio: 200,
        hipoteca: 100,
        propietario: null,
        hipotecada: false,
        tipo: 'ferrocarril',
        orden: 4,
        createdAt: serverTimestamp()
      }
    ];

    try {
      const stationsRef = collection(db, 'games', gameId, 'ferrocarriles');
      const snapshot = await getDocs(stationsRef);

      if (snapshot.empty) {
        const batch = defaultStations.map(station => 
          addDoc(stationsRef, station)
        );
        await Promise.all(batch);
        console.log('馃殏 Estaciones inicializadas correctamente');
      }
    } catch (error) {
      console.error('Error inicializando ferrocarriles:', error);
      throw error;
    }
  }

  // ==================== OPERACIONES FIRESTORE ==================== //

  /**
   * Carga las estaciones desde Firestore
   * @param {string} gameId - ID del juego
   */
  async loadStations(gameId) {
    try {
      const stationsRef = collection(db, 'games', gameId, 'ferrocarriles');
      const snapshot = await getDocs(stationsRef);
      
      this.estaciones = snapshot.docs.map(doc => ({
        id: doc.id, // A帽adir ID del documento
        ...doc.data()
      })).sort((a, b) => a.orden - b.orden); // Ordenar por posici贸n en tablero

      return this.estaciones;
    } catch (error) {
      console.error('Error cargando estaciones:', error);
      return [];
    }
  }

  /**
   * Actualiza una estaci贸n en Firestore
   * @param {string} gameId - ID del juego
   * @param {string} stationId - ID de la estaci贸n
   * @param {Object} updates - Campos a actualizar
   */
  async updateStation(gameId, stationId, updates) {
    try {
      const stationRef = doc(db, 'games', gameId, 'ferrocarriles', stationId);
      await updateDoc(stationRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Actualizar cache local
      const index = this.estaciones.findIndex(s => s.id === stationId);
      if (index !== -1) {
        this.estaciones[index] = { ...this.estaciones[index], ...updates };
      }

      return true;
    } catch (error) {
      console.error('Error actualizando estaci贸n:', error);
      return false;
    }
  }

  // ==================== L脫GICA DE JUEGO ==================== //

  /**
   * Compra una estaci贸n
   * @param {string} gameId - ID del juego
   * @param {string} stationId - ID de la estaci贸n
   * @param {string} playerId - ID del jugador comprador
   */
  async buyStation(gameId, stationId, playerId) {
    return this.updateStation(gameId, stationId, {
      propietario: playerId,
      hipotecada: false
    });
  }

  /**
   * Hipoteca una estaci贸n
   * @param {string} gameId - ID del juego
   * @param {string} stationId - ID de la estaci贸n
   */
  async mortgageStation(gameId, stationId) {
    return this.updateStation(gameId, stationId, {
      hipotecada: true
    });
  }

  /**
   * Paga la hipoteca de una estaci贸n
   * @param {string} gameId - ID del juego
   * @param {string} stationId - ID de la estaci贸n
   */
  async unmortgageStation(gameId, stationId) {
    return this.updateStation(gameId, stationId, {
      hipotecada: false
    });
  }

  // ==================== C脕LCULO DE RENTAS ==================== //

  /**
   * Calcula la renta seg煤n estaciones pose铆das
   * @param {string} stationId - ID de la estaci贸n actual
   * @param {string} playerId - ID del jugador due帽o
   * @return {number} Rentabilidad calculada
   */
  calculateRent(stationId, playerId) {
    const station = this.getStationById(stationId);
    if (!this.isValidStation(station, playerId)) return 0;

    const ownedCount = this.countOwnedStations(playerId);
    return this.calculateRentByCount(ownedCount);
  }

  /**
   * F贸rmula matem谩tica para rentas
   * @param {number} ownedCount - Cantidad de estaciones pose铆das (1-4)
   * @return {number} Rentabilidad
   */
  calculateRentByCount(ownedCount) {
    return 25 * Math.pow(2, ownedCount - 1);
    /* 
      Resultados:
      1 estaci贸n: $25 (25 * 2^0)
      2 estaciones: $50 (25 * 2^1) 
      3 estaciones: $100 (25 * 2^2)
      4 estaciones: $200 (25 * 2^3)
    */
  }

  // ==================== M脡TODOS AUXILIARES ==================== //

  getStationById(stationId) {
    return this.estaciones.find(s => s.id === stationId);
  }

  isValidStation(station, playerId) {
    return station && 
           station.propietario === playerId && 
           !station.hipotecada;
  }

  countOwnedStations(playerId) {
    return this.estaciones.filter(s => 
      s.propietario === playerId && !s.hipotecada
    ).length;
  }

  getAllStations() {
    return this.estaciones;
  }

  getStationsByOwner(playerId) {
    return this.estaciones.filter(s => s.propietario === playerId);
  }

  getMortgageValue(stationId) {
    const station = this.getStationById(stationId);
    return station ? station.hipoteca : 0;
  }

  getUnmortgageCost(stationId) {
    const value = this.getMortgageValue(stationId);
    return Math.ceil(value * 1.1); // 10% de inter茅s
  }
}

// Exportar como singleton
const ferrocarrilService = new FerrocarrilService();
export default ferrocarrilService;