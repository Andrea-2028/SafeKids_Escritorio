import { useState } from "react";
import api from "../Api/axiosInstance"; // tu instancia de Axios
import "../styles/RecoverEmail.css";

function RecoverEmail({ setView }) {

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  //Restrablecer contraseñas
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const resetToken = localStorage.getItem("resetToken");
    
    if (!resetToken) {
      setError("Token de recuperación no encontrado.");
      return;
    }

    try {
      const response = await api.post("/api1/users/change-password", {
        resetToken,
        password,
      });

      if (response.data.success) {
        setMessage("Contraseña actualizada exitosamente.");
        setTimeout(() => setView("login"), 2000); // redirigir al login
      } else {
        setError(response.data.message || "No se pudo cambiar la contraseña.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Error en la solicitud.";
      setError(msg);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="RecoverEmaillogo">Safe Kids</div>
        <img
          src={`${process.env.PUBLIC_URL}/img/logo.png`}
          alt="Logo"
          className="login-image"
        />
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
              <img
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
              title="Mostrar/ocultar contraseña"
                src={
                  showPassword
                    ? `${process.env.PUBLIC_URL}/icons/ojo-cerrado.png`
                    : `${process.env.PUBLIC_URL}/icons/ojo-abierto.png`
                }
                alt="Icono de visibilidad"
              />
          </div>

          <div className="password-container">
            <input
              type={showPassword2 ? "text" : "password"}
              placeholder="Confirma tu Nueva Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
              <img
              className="eye-icon"
              onClick={() => setShowPassword2(!showPassword2)}
              title="Mostrar/ocultar contraseña"
                src={
                  showPassword2
                    ? `${process.env.PUBLIC_URL}/icons/ojo-cerrado.png`
                    : `${process.env.PUBLIC_URL}/icons/ojo-abierto.png`
                }
                alt="Icono de visibilidad"
              />
          </div>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
}

export default RecoverEmail;
