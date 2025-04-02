import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

class CardService {
  constructor() {
    this.cards = []; // Cache local de propiedades
  }

  // ==================== FIRESTORE OPERATIONS ==================== //

  /**
   * Inicializa las propiedades estándar en Firestore (ejecutar solo una vez por juego)
   * @param {string} gameId - ID del documento del juego en 'games' collection
   */
  async initializeGameProperties(gameId) {
    const defaultProperties = [
        {
            id: 1,
            nombre: 'Mediterranean Avenue',
            color: 'Marrón',
            precio: 60,
            renta: [2, 10, 30, 90, 160, 250], // [base, 1c, 2c, 3c, 4c, hotel]
            precioCasa: 50,
            precioHotel: 50,
            grupo: 'brown',
            hipoteca: 30
        },
        {
            id: 2,
            nombre: 'Baltic Avenue',
            color: 'Marrón',
            precio: 60,
            renta: [4, 20, 60, 180, 320, 450],
            precioCasa: 50,
            precioHotel: 50,
            grupo: 'brown',
            hipoteca: 30
        },
        {
            id: 3,
            nombre: 'Oriental Avenue',
            color: 'Celeste',
            precio: 100,
            renta: [6, 30, 90, 270, 400, 550],
            precioCasa: 50,
            precioHotel: 50,
            grupo: 'light-blue',
            hipoteca: 50
        },
        {
            id: 4,
            nombre: 'Vermont Avenue',
            color: 'Celeste',
            precio: 100,
            renta: [6, 30, 90, 270, 400, 550],
            precioCasa: 50,
            precioHotel: 50,
            grupo: 'light-blue',
            hipoteca: 50
        },
        {
            id: 5,
            nombre: 'Connecticut Avenue',
            color: 'Celeste',
            precio: 120,
            renta: [8, 40, 100, 300, 450, 600],
            precioCasa: 50,
            precioHotel: 50,
            grupo: 'light-blue',
            hipoteca: 60
        },
        {
            id: 6,
            nombre: 'St. Charles Place',
            color: 'Rosa',
            precio: 140,
            renta: [10, 50, 150, 450, 625, 750],
            precioCasa: 100,
            precioHotel: 100,
            grupo: 'pink',
            hipoteca: 70
        },
        {
            id: 7,
            nombre: 'States Avenue',
            color: 'Rosa',
            precio: 140,
            renta: [10, 50, 150, 450, 625, 750],
            precioCasa: 100,
            precioHotel: 100,
            grupo: 'pink',
            hipoteca: 70
        },
        {
            id: 8,
            nombre: 'Virginia Avenue',
            color: 'Rosa',
            precio: 160,
            renta: [12, 60, 180, 500, 700, 900],
            precioCasa: 100,
            precioHotel: 100,
            grupo: 'pink',
            hipoteca: 80
        },
        {
            id: 9,
            nombre: 'St. James Place',
            color: 'Naranja',
            precio: 180,
            renta: [14, 70, 200, 550, 750, 950],
            precioCasa: 100,
            precioHotel: 100,
            grupo: 'orange',
            hipoteca: 90
        },
        {
            id: 10,
            nombre: 'Tennessee Avenue',
            color: 'Naranja',
            precio: 180,
            renta: [14, 70, 200, 550, 750, 950],
            precioCasa: 100,
            precioHotel: 100,
            grupo: 'orange',
            hipoteca: 90
        },
        {
            id: 11,
            nombre: 'New York Avenue',
            color: 'Naranja',
            precio: 200,
            renta: [16, 80, 220, 600, 800, 1000],
            precioCasa: 100,
            precioHotel: 100,
            grupo: 'orange',
            hipoteca: 100
        },
        {
            id: 12,
            nombre: 'Kentucky Avenue',
            color: 'Rojo',
            precio: 220,
            renta: [18, 90, 250, 700, 875, 1050],
            precioCasa: 150,
            precioHotel: 150,
            grupo: 'red',
            hipoteca: 110
        },
        {
            id: 13,
            nombre: 'Indiana Avenue',
            color: 'Rojo',
            precio: 220,
            renta: [18, 90, 250, 700, 875, 1050],
            precioCasa: 150,
            precioHotel: 150,
            grupo: 'red',
            hipoteca: 110
        },
        {
            id: 14,
            nombre: 'Illinois Avenue',
            color: 'Rojo',
            precio: 240,
            renta: [20, 100, 300, 750, 925, 1100],
            precioCasa: 150,
            precioHotel: 150,
            grupo: 'red',
            hipoteca: 120
        },
        {
            id: 15,
            nombre: 'Atlantic Avenue',
            color: 'Amarillo',
            precio: 260,
            renta: [22, 110, 330, 800, 975, 1150],
            precioCasa: 150,
            precioHotel: 150,
            grupo: 'yellow',
            hipoteca: 130
        },
        {
            id: 16,
            nombre: 'Ventnor Avenue',
            color: 'Amarillo',
            precio: 260,
            renta: [22, 110, 330, 800, 975, 1150],
            precioCasa: 150,
            precioHotel: 150,
            grupo: 'yellow',
            hipoteca: 130
        },
        {
            id: 17,
            nombre: 'Marvin Gardens',
            color: 'Amarillo',
            precio: 280,
            renta: [24, 120, 360, 850, 1025, 1200],
            precioCasa: 150,
            precioHotel: 150,
            grupo: 'yellow',
            hipoteca: 140
        },
        {
            id: 18,
            nombre: 'Pacific Avenue',
            color: 'Verde',
            precio: 300,
            renta: [26, 130, 390, 900, 1100, 1275],
            precioCasa: 200,
            precioHotel: 200,
            grupo: 'green',
            hipoteca: 150
        },
        {
            id: 19,
            nombre: 'North Carolina Avenue',
            color: 'Verde',
            precio: 300,
            renta: [26, 130, 390, 900, 1100, 1275],
            precioCasa: 200,
            precioHotel: 200,
            grupo: 'green',
            hipoteca: 150
        },
        {
            id: 20,
            nombre: 'Pennsylvania Avenue',
            color: 'Verde',
            precio: 320,
            renta: [28, 150, 450, 1000, 1200, 1400],
            precioCasa: 200,
            precioHotel: 200,
            grupo: 'green',
            hipoteca: 160
        },
        {
            id: 21,
            nombre: 'Park Place',
            color: 'Azul',
            precio: 350,
            renta: [35, 175, 500, 1100, 1300, 1500],
            precioCasa: 200,
            precioHotel: 200,
            grupo: 'blue',
            hipoteca: 175
        },
        {
            id: 22,
            nombre: 'Boardwalk',
            color: 'Azul',
            precio: 400,
            renta: [50, 200, 600, 1400, 1700, 2000],
            precioCasa: 200,
            precioHotel: 200,
            grupo: 'blue',
            hipoteca: 200
        }
    ];

    try {
      const propertiesRef = collection(db, 'games', gameId, 'properties');
      
      // Verificar si ya existen propiedades
      const snapshot = await getDocs(propertiesRef);
      if (snapshot.empty) {
        // Añadir todas las propiedades
        const batch = defaultProperties.map(prop => 
          addDoc(propertiesRef, prop)
        );
        await Promise.all(batch);
        console.log('✅ Propiedades inicializadas en Firestore');
      }
    } catch (error) {
      console.error('🔥 Error inicializando propiedades:', error);
      throw error;
    }
  }

  /**
   * Carga todas las propiedades desde Firestore
   * @param {string} gameId - ID del juego
   */
  async loadProperties(gameId) {
    try {
      const propertiesRef = collection(db, 'games', gameId, 'properties');
      const snapshot = await getDocs(propertiesRef);
      
      this.cards = snapshot.docs.map(doc => ({
        id: doc.id, // Añadir el ID del documento
        ...doc.data()
      }));

      return this.cards;
    } catch (error) {
      console.error('Error cargando propiedades:', error);
      return [];
    }
  }

  /**
   * Actualiza una propiedad en Firestore
   * @param {string} gameId - ID del juego
   * @param {string} propertyId - ID de la propiedad
   * @param {Object} updates - Campos a actualizar
   */
  async updateProperty(gameId, propertyId, updates) {
    try {
      const propertyRef = doc(db, 'games', gameId, 'properties', propertyId);
      await updateDoc(propertyRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Actualizar cache local
      const index = this.cards.findIndex(c => c.id === propertyId);
      if (index !== -1) {
        this.cards[index] = { ...this.cards[index], ...updates };
      }

      return true;
    } catch (error) {
      console.error('Error actualizando propiedad:', error);
      return false;
    }
  }

  // ==================== GAME LOGIC METHODS ==================== //

  /**
   * Compra una propiedad (asigna propietario)
   * @param {string} gameId - ID del juego
   * @param {string} propertyId - ID de la propiedad
   * @param {string} playerId - ID del jugador comprador
   */
  async buyProperty(gameId, propertyId, playerId) {
    return this.updateProperty(gameId, propertyId, {
      propietario: playerId,
      hipotecada: false
    });
  }

  /**
   * Compra una casa para una propiedad
   * @param {string} gameId - ID del juego
   * @param {string} propertyId - ID de la propiedad
   */
  async buyHouse(gameId, propertyId) {
    const property = this.cards.find(p => p.id === propertyId);
    if (!property || property.casas >= 4 || property.hotel) return false;

    return this.updateProperty(gameId, propertyId, {
      casas: property.casas + 1
    });
  }

  /**
   * Compra un hotel (reemplaza 4 casas)
   * @param {string} gameId - ID del juego
   * @param {string} propertyId - ID de la propiedad
   */
  async buyHotel(gameId, propertyId) {
    const property = this.cards.find(p => p.id === propertyId);
    if (!property || property.casas < 4 || property.hotel) return false;

    return this.updateProperty(gameId, propertyId, {
      casas: 0,
      hotel: true
    });
  }

  /**
   * Hipoteca una propiedad
   * @param {string} gameId - ID del juego
   * @param {string} propertyId - ID de la propiedad
   */
  async mortgageProperty(gameId, propertyId) {
    return this.updateProperty(gameId, propertyId, {
      hipotecada: true
    });
  }

  /**
   * Paga la hipoteca de una propiedad
   * @param {string} gameId - ID del juego
   * @param {string} propertyId - ID de la propiedad
   */
  async unmortgageProperty(gameId, propertyId) {
    return this.updateProperty(gameId, propertyId, {
      hipotecada: false
    });
  }

  // ==================== CALCULATION METHODS ==================== //

  /**
   * Calcula la renta actual de una propiedad
   * @param {string} propertyId - ID de la propiedad
   * @return {number} Valor de la renta
   */
  calculateRent(propertyId) {
    const property = this.cards.find(p => p.id === propertyId);
    if (!property || !property.propietario || property.hipotecada) return 0;

    if (property.hotel) return property.renta[5];
    return property.renta[property.casas];
  }

  /**
   * Verifica si un jugador tiene monopolio (todas las propiedades del mismo color)
   * @param {string} playerId - ID del jugador
   * @param {string} color - Color del grupo
   */
  hasMonopoly(playerId, color) {
    const propertiesInGroup = this.cards.filter(p => p.color === color);
    return propertiesInGroup.every(p => p.propietario === playerId);
  }

  // ==================== UTILITY METHODS ==================== //

  getPropertyById(propertyId) {
    return this.cards.find(p => p.id === propertyId);
  }

  getPropertiesByOwner(playerId) {
    return this.cards.filter(p => p.propietario === playerId);
  }

  getPropertiesByColor(color) {
    return this.cards.filter(p => p.color === color);
  }

  getMortgageValue(propertyId) {
    const property = this.getPropertyById(propertyId);
    return property ? property.hipoteca : 0;
  }

  getUnmortgageCost(propertyId) {
    const mortgageValue = this.getMortgageValue(propertyId);
    return Math.ceil(mortgageValue * 1.1); // 10% de interés
  }
}

// Exportar como singleton
const cardService = new CardService();
export default cardService;