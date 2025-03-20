import axios from 'axios';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api", 
    headers: {
      "Content-Type": "application/json",
    },
  });
  

export default api;
