import axios from 'axios';
import { Platform } from 'react-native';
import storage from '../utils/storage';

// URL del backend desplegado en Render
const PROD_API_URL = "https://restapart.onrender.com/api";

// Para desarrollo en Android, localhost debe ser reemplazado por 10.0.2.2
// que es la dirección especial que apunta al localhost de la máquina host desde el emulador
const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return PROD_API_URL;
  } else if (Platform.OS === 'android') {
    // Si estás en un emulador Android y el backend está en tu máquina local,
    // descomenta la siguiente línea y comenta la línea de PROD_API_URL
    // return "http://10.0.2.2:8080/api";
    return PROD_API_URL; // Usamos la URL de producción por defecto
  } else {
    // iOS u otros
    return PROD_API_URL;
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Añadir interceptor para manejar automáticamente el token de autenticación
api.interceptors.request.use(
  async (config) => {
    // Si la petición no incluye ya un token de autorización, intentamos añadirlo
    if (!config.headers.Authorization) {
      try {
        const token = await storage.getItem('jwt');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error al recuperar el token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores comunes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejamos errores comunes aquí
    if (error.response) {
      if (error.response.status === 401) {
        // Error de autenticación, podríamos redirigir a login
        console.log('Error de autenticación');
      }
      console.error('Error de respuesta:', error.response.data);
    } else if (error.request) {
      console.error('Error de solicitud (no se recibió respuesta):', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
