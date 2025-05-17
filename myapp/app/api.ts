import axios from 'axios';
import { Platform } from 'react-native';

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

export default api;
