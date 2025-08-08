import React, { useState, useRef } from 'react';
import api from '../Api/axiosInstance';
import '../styles/RecoverCode.css';

function RecoverCode({ setView }) {
  const [codes, setCodes] = useState(new Array(6).fill(''));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async () => {
    const code = codes.join("");

    if (code.length !== 6) {
      setError("Debes ingresar los 6 dígitos.");
      return;
    } 

    try {
      const response = await api.post("/api1/users/password-challenge", { code });

      if (response.data.success) {
        setMessage(response.data.message);
        localStorage.setItem("resetToken", response.data.resetToken);
        setView("resetPassword");
      } else {
        setError("Código inválido.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Ocurrió un error.");
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-box">
        <button className="cancel-button" onClick={() => setView("login")}>
          <img src={`${process.env.PUBLIC_URL}/icons/5.png`} alt="Cancelar" />
        </button>
        <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="logo" className="verification-logo" />
        <h2 className="verification-title">Código De Verificación</h2>
        <p className="verification-instructions">
          INGRESA LOS 6 DÍGITOS DE SEGURIDAD ENVIADOS A TU CORREO
        </p>

        <div className="code-inputs">
          {codes.map((code, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="code-input"
              value={code}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputsRef.current[index] = el)}
            />
          ))}
        </div>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <button className="submit-btn" onClick={handleSubmit}>Enviar</button>
      </div>
    </div>
  );
}

export default RecoverCode;
