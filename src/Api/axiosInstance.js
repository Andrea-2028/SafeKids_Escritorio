// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // Laravel backend
  //baseURL: "https://apidev.safekids.site",
  withCredentials: true,           // si usas cookies o auth
});

export default api;
