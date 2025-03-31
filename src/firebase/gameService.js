import { db } from './config'  // llama base de datos
import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot, getDocs, serverTimestamp, deleteDoc, addDoc } from 'firebase/firestore' //manejar los registros de base de datos
import { getAuth } from 'firebase/auth' //funcion obtener autentificacion

class GameService {
  constructor() {
    this.gamesCollection = collection(db, 'games')
    this.auth = getAuth()
  }

  // Obtiene el nombre del jugador del documento del usuario
  async getPlayerName(userId) {
    if (!userId) {
      throw new Error('ID de usuario no proporcionado')
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado')
      }
      
      const userData = userDoc.data()
      if (!userData.nombre) {
        throw new Error('El usuario no tiene un nombre configurado')
      }

      return userData.nombre
    } catch (error) {
      console.error('Error al obtener el nombre del usuario:', error)
      throw error
    }
  }

  // Genera un código aleatorio para la sala (6 caracteres alfanuméricos en mayúsculas)
  generateGameCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const length = 6
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
  }

  // Genera un ID único para el jugador
  generatePlayerId() {
    const randomStr = Math.random().toString(36).substr(2, 9).toUpperCase()
    return `P${randomStr}`
  }

  // Verifica si el usuario está autenticado
  checkAuth() {
    if (!this.auth.currentUser) {
      throw new Error('Debes estar autenticado para realizar esta acción')
    }
    return this.auth.currentUser
  }

  // Crea una nueva sala de juego
  async createGame(hostId) {
    this.checkAuth()

    if (!hostId) {
      throw new Error('ID del anfitrión no proporcionado')
    }

    try {
      const gameCode = this.generateGameCode()
      const gameRef = doc(this.gamesCollection, gameCode)
      const playersCollection = collection(gameRef, 'players')
      const playerUid = this.generatePlayerId()
      
      // Obtener el nombre del usuario
      const playerName = await this.getPlayerName(hostId)
      
      // Crear el documento del juego
      await setDoc(gameRef, {
        gameCode,
        hostId,
        status: 'waiting',
        createdAt: new Date(),
        updatedAt: new Date(),
        playerCount: 1,
        maxPlayers: 6
      })

      // Crear el documento del host en la subcolección players
      await setDoc(doc(playersCollection, playerUid), {
        uid: playerUid,
        id_user: hostId,
        name: playerName,
        isHost: true,
        saldo: 1500,
        isBankrupt: false,
        joinedAt: new Date()
      })

      return gameCode
    } catch (error) {
      console.error('Error al crear la sala:', error)
      throw new Error('No se pudo crear la sala de juego')
    }
  }

  // Obtiene los datos de una sala
  async getGame(gameCode) {
    if (!gameCode) {
      throw new Error('Código de sala no proporcionado')
    }

    try {
      const gameRef = doc(this.gamesCollection, gameCode)
      const gameDoc = await getDoc(gameRef)
      
      if (!gameDoc.exists()) {
        throw new Error('La sala no existe')
      }

      const playersCollection = collection(gameRef, 'players')
      const playersSnapshot = await getDocs(playersCollection)
      const players = playersSnapshot.docs.map(doc => ({
        ...doc.data(),
        docId: doc.id // Incluir el ID del documento para futuras referencias
      }))

      return {
        ...gameDoc.data(),
        players
      }
    } catch (error) {
      console.error('Error al obtener la sala:', error)
      throw error
    }
  }

  // Suscribe a los cambios de una sala y sus jugadores
  subscribeToGame(gameCode, callback) {
    if (!gameCode || typeof callback !== 'function') {
      throw new Error('Código de sala y callback son requeridos')
    }

    const gameRef = doc(this.gamesCollection, gameCode)
    const playersCollection = collection(gameRef, 'players')

    // Suscribirse a cambios en el documento del juego
    const gameUnsubscribe = onSnapshot(gameRef, async (gameDoc) => {
      if (!gameDoc.exists()) {
        callback(null)
        return
      }

      try {
        const playersSnapshot = await getDocs(playersCollection)
        const players = playersSnapshot.docs.map(doc => ({
          ...doc.data(),
          docId: doc.id
        }))

        callback({
          ...gameDoc.data(),
          players
        })
      } catch (error) {
        console.error('Error al obtener jugadores:', error)
        callback(null)
      }
    }, error => {
      console.error('Error en la suscripción del juego:', error)
      callback(null)
    })

    // Suscribirse a cambios en la colección de jugadores
    const playersUnsubscribe = onSnapshot(playersCollection, async (snapshot) => {
      if (snapshot.empty) return

      try {
        const gameDoc = await getDoc(gameRef)
        if (!gameDoc.exists()) return

        const players = snapshot.docs.map(doc => ({
          ...doc.data(),
          docId: doc.id
        }))

        callback({
          ...gameDoc.data(),
          players
        })
      } catch (error) {
        console.error('Error al actualizar jugadores:', error)
      }
    }, error => {
      console.error('Error en la suscripción de jugadores:', error)
    })

    // Retornar función para cancelar ambas suscripciones
    return () => {
      gameUnsubscribe()
      playersUnsubscribe()
    }
  }

  // Une a un jugador a la sala
  async joinGame(gameCode, userId) {
    this.checkAuth()

    if (!gameCode || !userId) {
      throw new Error('Código de sala y ID de usuario son requeridos')
    }

    try {
      const gameRef = doc(this.gamesCollection, gameCode)
      const gameDoc = await getDoc(gameRef)

      if (!gameDoc.exists()) {
        throw new Error('La sala no existe')
      }

      const gameData = gameDoc.data()
      
      if (gameData.status !== 'waiting') {
        throw new Error('No puedes unirte a una partida en curso')
      }

      if (gameData.playerCount >= (gameData.maxPlayers || 6)) {
        throw new Error('La sala está llena')
      }

      const playersCollection = collection(gameRef, 'players')
      const playersSnapshot = await getDocs(playersCollection)
      
      // Verificar si el usuario ya está en la sala
      const existingPlayer = playersSnapshot.docs.find(doc => doc.data().id_user === userId)
      if (existingPlayer) {
        throw new Error('Ya estás en esta sala')
      }

      const playerUid = this.generatePlayerId()
      const playerName = await this.getPlayerName(userId)

      // Crear el documento del jugador
      await setDoc(doc(playersCollection, playerUid), {
        uid: playerUid,
        id_user: userId,
        name: playerName,
        isHost: false,
        saldo: 1500,
        isBankrupt: false,
        joinedAt: new Date()
      })

      // Actualizar el contador de jugadores
      await updateDoc(gameRef, {
        playerCount: gameData.playerCount + 1,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error al unirse a la sala:', error)
      throw error
    }
  }

  // Inicia el juego
  async startGame(gameCode) {
    try {
      const gameRef = doc(db, 'games', gameCode)
      await updateDoc(gameRef, {
        status: 'in_progress',
        startedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error al iniciar el juego:', error)
      throw error
    }
  }

  async leaveGame(gameCode, userId) {
    this.checkAuth()

    if (!gameCode || !userId) {
      throw new Error('Código de sala y ID de usuario son requeridos')
    }

    try {
      const gameRef = doc(this.gamesCollection, gameCode)
      const playersCollection = collection(gameRef, 'players')
      const playersSnapshot = await getDocs(playersCollection)
      
      const playerDoc = playersSnapshot.docs.find(doc => doc.data().id_user === userId)
      
      if (!playerDoc) {
        throw new Error('Jugador no encontrado en la partida')
      }

      // Eliminar al jugador de la partida
      await deleteDoc(doc(playersCollection, playerDoc.id))

      // Actualizar el contador de jugadores en el documento del juego
      const gameDoc = await getDoc(gameRef)
      if (gameDoc.exists()) {
        const gameData = gameDoc.data()
        await updateDoc(gameRef, {
          playerCount: Math.max(0, gameData.playerCount - 1),
          updatedAt: new Date()
        })
      }
    } catch (error) {
      console.error('Error al salir de la partida:', error)
      throw error
    }
  }

  async makeTransaction(gameCode, { from, to, amount }) {
    this.checkAuth()

    if (!gameCode || !from || !to || !amount) {
      throw new Error('Faltan datos para la transacción')
    }

    try {
      const gameRef = doc(this.gamesCollection, gameCode)
      const playersCollection = collection(gameRef, 'players')
      const playersSnapshot = await getDocs(playersCollection)
      
      const fromPlayer = playersSnapshot.docs.find(doc => doc.data().id_user === from)
      
      if (!fromPlayer) {
        throw new Error('Jugador origen no encontrado')
      }

      const fromPlayerData = fromPlayer.data()
      
      if (fromPlayerData.saldo < amount) {
        throw new Error('Saldo insuficiente')
      }

      // Si el destino es el banco, solo actualizamos el saldo del jugador origen
      if (to === 'Banco') {
        await updateDoc(doc(playersCollection, fromPlayer.id), {
          saldo: fromPlayerData.saldo - amount
        })
      } else {
        // Si el destino es otro jugador, actualizamos ambos saldos
        const toPlayer = playersSnapshot.docs.find(doc => doc.data().name === to)
        
        if (!toPlayer) {
          throw new Error('Jugador destino no encontrado')
        }

        const toPlayerData = toPlayer.data()

        // Actualizamos ambos saldos en una transacción
        await updateDoc(doc(playersCollection, fromPlayer.id), {
          saldo: fromPlayerData.saldo - amount
        })

        await updateDoc(doc(playersCollection, toPlayer.id), {
          saldo: toPlayerData.saldo + amount
        })
      }

      // Registrar la transacción en el historial
      const transactionsCollection = collection(gameRef, 'transactions')
      await addDoc(transactionsCollection, {
        from: fromPlayerData.name,
        to,
        amount,
        timestamp: serverTimestamp()
      })

    } catch (error) {
      console.error('Error al realizar la transacción:', error)
      throw error
    }
  }
}

export const gameService = new GameService() 