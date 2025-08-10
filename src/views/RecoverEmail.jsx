import { useState } from "react";
import api from "../Api/axiosInstance"; // Asegúrate que esta sea tu instancia de Axios
import "../styles/RecoverEmail.css";

function RecoverEmail({ setView }) {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  //Verificar el correo
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Por favor ingresa tu correo.");
      return;
    }

    try {
      const res = await api.post("/api1/users/reset-password", { email });
      if (res.data.success) {
        setError("");
        localStorage.setItem("recoveryEmail", email); // guarda el correo para usarlo en el siguiente paso
        setTimeout(() => setView("recoverCode"), 1000); // cambia de vista después de 1s
      } else {
        setError(res.data.message || "Error al enviar el correo.");
        setMessage("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error del servidor.");
      setMessage("");
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
          <h2>Recuperación</h2>
          <p className="instruction">Favor de ingresar tu correo registrado</p>
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
          <a href="#" className="forgot-password" onClick={() => setView("login")}>
            Iniciar Sesión
          </a>
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
}

export default RecoverEmail;
