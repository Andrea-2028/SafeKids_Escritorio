import { useState } from "react";
import "../styles/Login.css";
import { loginUser } from "../Api/Auth";
import api from '../Api/axiosInstance.js';

function Login({ setView }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Por favor llena todos los campos.");
      return;
    }
    try {
          const response = await api.post("/api1/users/login", {
            email,
            password,
          });

      const data = response.data;
          
          // Guardar el temporaryToken en localStorage
      localStorage.setItem("temporaryToken", data.temporaryToken);
      // Guardamos el usuario si es necesario
      localStorage.setItem("user", JSON.stringify(data.user));
      // Cambiamos de vista

      setView("secondFactor");
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Error al iniciar sesión.";
      setErrorMsg(message);
    }

  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="logo">Safe Kids</div>
        <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="Logo" className="login-image" />
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Ingresar</h2>
          <p className="instruction">Favor De Llenar Los Campos Solicitados</p>

          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
            className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
              title="Mostrar/ocultar contraseña"
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <a href="#" className="forgot-password" onClick={() => setView("recoverEmail")}>
            ¿Olvidaste tu contraseña?
          </a>

          <button type="submit">Ingresar</button>

          {errorMsg && <p className="error-msg">{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;
