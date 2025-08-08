import { useEffect, useState } from "react";
import "../styles/Profile.css";
import "../styles/text.css";
import "../styles/components.css";
import Layout from "../components/Layout1.jsx";
import api from "../Api/axiosInstance.js";

function Profile({ setView }) {
  const [user, setUser] = useState(null);
  const user2 = JSON.parse(localStorage.getItem("user"));
  console.log("usuario:", user, user2);

  const school = JSON.parse(localStorage.getItem("school"));
  const schoolId = school?.id;
  console.log("escuela id:",schoolId);

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

const handleLogout = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await api.post("/api1/users/logout", null, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = response.data;

    if (data.success) {
      localStorage.removeItem("token");
      localStorage.removeItem("email"); // si lo usas

      setView("login"); // cambia de vista si corresponde
    } else {
      console.error("Error al cerrar sesión:", data.message);
    }
  } catch (error) {
    console.error("Error en logout:", error.response?.data || error.message);
  }
};


  return (
    <Layout>
      <div className="imageprofile">
<img
  src={`https://apidev.safekids.site/imagenes/${schoolId}/USERS/${user2.profilePhoto}`}
  onError={(e) => {
    e.target.onerror = null; // evita un bucle si también falla la imagen por defecto
    e.target.src = `${process.env.PUBLIC_URL}/img/logo.png`;
  }}
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
        <h2>Mi información</h2>
        <div className="profile-info2">
          
  <div className="profile-info2-1">
    <p><strong>Nombre:</strong></p>
    <p><strong>Apellido:</strong></p>
    <p><strong>Teléfono:</strong></p>
    <p><strong>Correo Electrónico:</strong></p>
  </div>
  <div className="profile-info2-2editable">
    <p><label>{user?.firstName ?? "Cargando..."}</label></p>
    <p><label>{user?.lastName ?? "Cargando..."}</label></p>
    <p><label>{user?.phone ?? "Cargando..."}</label></p>
    <p><label>{user?.email ?? "Cargando..."}</label></p>
  </div>

        </div>
        <div className="profile-buttons">
          <button className="btn-primary" onClick={handleLogout}>
            <img
              src={`${process.env.PUBLIC_URL}/icons/8.png`}
              alt="profile"
              className="iconexit"
            />
            <span className="btn-text">Cerrar Sesión</span>
          </button>
          <button className="btn-secondary" onClick={() => setView("edit-profile")}>
            <span className="btn-text2">Modificar Datos</span>
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
