import axios from 'axios';

// Obtener el token del LocalStorage
const token = localStorage.getItem('jwt');

const apiClient = axios.create({
    baseURL: 'http://localhost:8080', // URL del backend
    headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '', // Enviar JWT si existe
    },
});

export default apiClient;
