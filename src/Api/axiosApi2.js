// src/api/axiosApi2.js
import axios from "axios";

const api2 = axios.create({
  //baseURL: "http://127.0.0.1:8001", // tu backend 2 (upload, etc.)
  baseURL: "https://api2.safekids.site/",
  withCredentials: true,
});

export default api2;