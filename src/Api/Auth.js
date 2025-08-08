import api from '../Api/axiosInstance.js';

export async function loginUser(email, password) {
  try {
    const response = await api.post("/api1/users/login", {
      email,
      password,
    });

    const data = response.data;

    // Guardar el temporaryToken en localStorage
    localStorage.setItem("temporaryToken", data.temporaryToken);

    return data;
  } catch (error) {
    // Puedes acceder a la respuesta del servidor (si existe) así:
    const message = error.response?.data?.message || "Error al iniciar sesión";
    throw new Error(message);
  }
}

