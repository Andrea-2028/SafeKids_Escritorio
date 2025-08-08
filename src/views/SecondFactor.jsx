import React, { useState, useRef } from 'react';
import '../styles/RecoverCode.css';
import api from '../Api/axiosInstance.js';

function SecondFactor({ setView }) {
  const [codes, setCodes] = useState(new Array(6).fill(''));
  const [error, setError] = useState('');
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
  const code = codes.join('');
  if (code.length !== 6) {
    setError('Código incompleto');
    return;
  }

  try {
    const temporaryToken = localStorage.getItem('temporaryToken');

    const response = await api.post("/api1/users/verify-2fa", {
      code,
      temporaryToken,
    });

    const data = response.data;

    // Guarda el token
    localStorage.setItem("token", data.token);
    console.log("Token guardado:", data.token);

    // Guarda el usuario y la escuela en localStorage
    localStorage.setItem("user", JSON.stringify(data.data));
    if (data.school) {
      localStorage.setItem("school", JSON.stringify(data.school));
    }

    setView("home");
  } catch (error) {
    const message = error.response?.data?.message || "Error al verificar código";
    setError(message);
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

        {error && <p className="error-text">{error}</p>}
        <button className="submit-btn" onClick={handleSubmit}>Enviar</button>
      </div>
    </div>
  );
}

export default SecondFactor;
