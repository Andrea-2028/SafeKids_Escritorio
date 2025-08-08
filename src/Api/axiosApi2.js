// src/api/axiosApi2.js
import axios from "axios";

const api2 = axios.create({
  baseURL: "http://127.0.0.1:8001", // tu backend 2 (upload, etc.)
  //baseURL: "http://159.223.195.148:8001",
  withCredentials: true,
});

export default api2;