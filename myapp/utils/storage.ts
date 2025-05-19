import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Verificar si estamos en un entorno web y window está disponible
const isWebWithStorage = () => {
  return Platform.OS === 'web' && 
         typeof window !== 'undefined' && 
         typeof localStorage !== 'undefined';
};

// Verificar si sessionStorage está disponible
const hasSessionStorage = () => {
  return Platform.OS === 'web' && 
         typeof window !== 'undefined' && 
         typeof sessionStorage !== 'undefined';
};

// Utilidad que permite usar la misma API de almacenamiento en web y nativo
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isWebWithStorage()) {
        return localStorage.getItem(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isWebWithStorage()) {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      if (isWebWithStorage()) {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  },
  
  clear: async (): Promise<void> => {
    try {
      if (isWebWithStorage()) {
        localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  },

  // Métodos para sessionStorage (solo funcionan en web)
  session: {
    getItem: async (key: string): Promise<string | null> => {
      try {
        if (hasSessionStorage()) {
          return sessionStorage.getItem(key);
        } else {
          // En dispositivos móviles, sessionStorage no existe, así que usamos AsyncStorage con un prefijo
          return await AsyncStorage.getItem(`session_${key}`);
        }
      } catch (error) {
        console.error(`Error getting session item ${key}:`, error);
        return null;
      }
    },
    
    setItem: async (key: string, value: string): Promise<void> => {
      try {
        if (hasSessionStorage()) {
          sessionStorage.setItem(key, value);
        } else {
          // En dispositivos móviles, usamos AsyncStorage con un prefijo
          await AsyncStorage.setItem(`session_${key}`, value);
        }
      } catch (error) {
        console.error(`Error setting session item ${key}:`, error);
      }
    },
    
    removeItem: async (key: string): Promise<void> => {
      try {
        if (hasSessionStorage()) {
          sessionStorage.removeItem(key);
        } else {
          await AsyncStorage.removeItem(`session_${key}`);
        }
      } catch (error) {
        console.error(`Error removing session item ${key}:`, error);
      }
    },
    
    clear: async (): Promise<void> => {
      try {
        if (hasSessionStorage()) {
          sessionStorage.clear();
        } else {
          // En móvil, tendríamos que eliminar todos los elementos con prefijo "session_"
          // Esto es un poco más complejo y no es exactamente equivalente
          const keys = await AsyncStorage.getAllKeys();
          const sessionKeys = keys.filter(k => k.startsWith('session_'));
          if (sessionKeys.length > 0) {
            await AsyncStorage.multiRemove(sessionKeys);
          }
        }
      } catch (error) {
        console.error("Error clearing session storage:", error);
      }
    }
  }
};

export default storage; 