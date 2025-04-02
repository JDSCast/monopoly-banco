import { db } from './config';
import { collection, doc, getDocs, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

class ServiciosService {
  constructor() {
    this.servicios = []; // Cache local de servicios
  }

  // ==================== INICIALIZACIÓN ==================== //

  /**
   * Inicializa los servicios en Firestore (Electricidad y Agua)
   * @param {string} gameId - ID del juego
   */
  async initializeServices(gameId) {
    const defaultServices = [
      {
        nombre: 'Compañía de Electricidad',
        precio: 150,
        hipoteca: 75,
        propietario: null,
        hipotecada: false,
        tipo: 'servicio',
        orden: 1,
        createdAt: serverTimestamp()
      },
      {
        nombre: 'Compañía de Agua',
        precio: 150,
        hipoteca: 75,
        propietario: null,
        hipotecada: false,
        tipo: 'servicio',
        orden: 2,
        createdAt: serverTimestamp()
      }
    ];

    try {
      const servicesRef = collection(db, 'games', gameId, 'servicios');
      const snapshot = await getDocs(servicesRef);

      if (snapshot.empty) {
        const batch = defaultServices.map(service => 
          addDoc(servicesRef, service)
        );
        await Promise.all(batch);
        console.log('💡 Servicios inicializados correctamente');
      }
    } catch (error) {
      console.error('Error inicializando servicios:', error);
      throw error;
    }
  }

  // ==================== OPERACIONES FIRESTORE ==================== //

  /**
   * Carga los servicios desde Firestore
   * @param {string} gameId - ID del juego
   */
  async loadServices(gameId) {
    try {
      const servicesRef = collection(db, 'games', gameId, 'servicios');
      const snapshot = await getDocs(servicesRef);
      
      this.servicios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => a.orden - b.orden);

      return this.servicios;
    } catch (error) {
      console.error('Error cargando servicios:', error);
      return [];
    }
  }

  /**
   * Actualiza un servicio en Firestore
   * @param {string} gameId - ID del juego
   * @param {string} serviceId - ID del servicio
   * @param {Object} updates - Campos a actualizar
   */
  async updateService(gameId, serviceId, updates) {
    try {
      const serviceRef = doc(db, 'games', gameId, 'servicios', serviceId);
      await updateDoc(serviceRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Actualizar cache local
      const index = this.servicios.findIndex(s => s.id === serviceId);
      if (index !== -1) {
        this.servicios[index] = { ...this.servicios[index], ...updates };
      }

      return true;
    } catch (error) {
      console.error('Error actualizando servicio:', error);
      return false;
    }
  }

  // ==================== LÓGICA DE JUEGO ==================== //

  /**
   * Compra un servicio
   * @param {string} gameId - ID del juego
   * @param {string} serviceId - ID del servicio
   * @param {string} playerId - ID del jugador comprador
   */
  async buyService(gameId, serviceId, playerId) {
    return this.updateService(gameId, serviceId, {
      propietario: playerId,
      hipotecada: false
    });
  }

  /**
   * Hipoteca un servicio
   * @param {string} gameId - ID del juego
   * @param {string} serviceId - ID del servicio
   */
  async mortgageService(gameId, serviceId) {
    return this.updateService(gameId, serviceId, {
      hipotecada: true
    });
  }

  /**
   * Paga la hipoteca de un servicio
   * @param {string} gameId - ID del juego
   * @param {string} serviceId - ID del servicio
   */
  async unmortgageService(gameId, serviceId) {
    return this.updateService(gameId, serviceId, {
      hipotecada: false
    });
  }

  // ==================== CÁLCULO DE RENTAS ==================== //

  /**
   * Calcula la renta según reglas de Monopoly
   * @param {string} serviceId - ID del servicio
   * @param {string} playerId - ID del jugador dueño
   * @param {number} diceRoll - Resultado de los dados (2-12)
   * @return {number} Rentabilidad calculada
   */
  calculateRent(serviceId, playerId, diceRoll) {
    const service = this.getServiceById(serviceId);
    if (!this.isValidService(service, playerId)) return 0;

    const ownedCount = this.countOwnedServices(playerId);
    return this.calculateRentByDice(diceRoll, ownedCount);
  }

  /**
   * Fórmula matemática para rentas de servicios
   * @param {number} diceRoll - Suma de los dados (2-12)
   * @param {number} ownedCount - Cantidad de servicios poseídos (1-2)
   * @return {number} Rentabilidad
   */
  calculateRentByDice(diceRoll, ownedCount) {
    // Reglas oficiales de Monopoly:
    return diceRoll * (ownedCount === 1 ? 4 : 10);
    /* 
      - Si posee 1 servicio: 4 × valor de los dados
      - Si posee ambos: 10 × valor de los dados
    */
  }

  // ==================== MÉTODOS AUXILIARES ==================== //

  getServiceById(serviceId) {
    return this.servicios.find(s => s.id === serviceId);
  }

  isValidService(service, playerId) {
    return service && 
           service.propietario === playerId && 
           !service.hipotecada;
  }

  countOwnedServices(playerId) {
    return this.servicios.filter(s => 
      s.propietario === playerId && !s.hipotecada
    ).length;
  }

  getAllServices() {
    return this.servicios;
  }

  getServicesByOwner(playerId) {
    return this.servicios.filter(s => s.propietario === playerId);
  }

  getMortgageValue(serviceId) {
    const service = this.getServiceById(serviceId);
    return service ? service.hipoteca : 0;
  }

  getUnmortgageCost(serviceId) {
    const value = this.getMortgageValue(serviceId);
    return Math.ceil(value * 1.1); // 10% de interés
  }
}

// Exportar como singleton
const serviciosService = new ServiciosService();
export default serviciosService;