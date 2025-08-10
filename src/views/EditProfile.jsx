import { useEffect, useState } from "react";
import "../styles/Profile.css";
import "../styles/text.css";
import "../styles/components.css";
import Layout from "../components/Layout1.jsx";
import api from "../Api/axiosInstance.js";

function EditProfile({ setView }) {
  const [user, setUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

 //Funcion traer informacion de Perfil
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await api.get("/api1/users/my-profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = response.data;

        if (data.success) {
          setUser(data.data);
        } else {
          console.error("No se pudo obtener el perfil:", data.message);
        }
      } catch (error) {
        console.error("Error al obtener perfil:", error.response?.data || error.message);
      }
    };

    fetchProfile();
  }, []);

  //Funcion Editar mi Contraseña (Secretaria)
  const handlePasswordChange = async () => {
    const token = localStorage.getItem("token");
    setMessage(null);
    setError(null);

    if (!newPassword || newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      const response = await api.post("/api1/users/new-password",
        { password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = response.data;

      if (data.success) {
        setMessage("Contraseña actualizada exitosamente.");
        setNewPassword("");
        setTimeout(() => {
          setView("profile");
        }, 1500);
      } else {
        setError(data.message || "Error al cambiar contraseña.");
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setError("Error en la solicitud.");
    }
  };


  return (
    <Layout>
      <div className="imageprofile">
        <img
          src={`${process.env.PUBLIC_URL}/img/icono.jpg`}
          alt="Avatar"
          className="profile-avatar"
        />
      </div>
      <div className="profile-header">
        <div>
          <h2>
            {user
              ? `${user.firstName} ${user.lastName}`
              : "Cargando nombre..."}
          </h2>
        </div>
      </div>
      <div className="profile-info">
        <div className="profile-info2">
          <div className="profile-info2-1">
            <p><strong>Nombre:</strong></p>
            <p><strong>Apellido:</strong></p>
            <p><strong>Teléfono:</strong></p>
            <p><strong>Correo Electrónico:</strong></p>
            <p><strong>Nueva Contraseña:</strong></p>
          </div>
          <div className="profile-info2-2editable">
            <p><label>{user?.firstName ?? "Cargando..."}</label></p>
            <p><label>{user?.lastName ?? "Cargando..."}</label></p>
            <p><label>{user?.phone ?? "Cargando..."}</label></p>
            <p><label>{user?.email ?? "Cargando..."}</label></p>
            <p>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña"
                className="input-editable"
              />
            </p>
          </div>
        </div>

        {/* Mensajes */}
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="profile-buttons">
          <button className="btn-primaryEdit" onClick={handlePasswordChange}>
            <span className="btn-text2">Guardar Cambios</span>
          </button>
          <button className="btn-secondaryEdit" onClick={() => setView("profile")}>
            <span className="btn-text2">Cancelar</span>
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default EditProfile;
