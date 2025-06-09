import axios from 'axios';
import storage from '../utils/storage';

const PROD_API_URL = "https://restapart.onrender.com/api";

// Para desarrollo en Android, localhost debe ser reemplazado por 10.0.2.2
// que es la dirección especial que apunta al localhost de la máquina host desde el emulador
const getBaseURL = () => {
    return PROD_API_URL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
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
