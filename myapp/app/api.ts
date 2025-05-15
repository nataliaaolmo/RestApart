import axios from 'axios';

const api = axios.create({
baseURL: "https://restapart.onrender.com/api",
    headers: {
      "Content-Type": "application/json",
    },
  });
  

export default api;
