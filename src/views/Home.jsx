
import "../styles/text.css";
import { useEffect, useState } from "react";
import api from '../Api/axiosInstance.js'; // Asegúrate que la ruta sea correcta
function Home() {

  const [user, setUser] = useState(null);
  
 //Mostrar el nombre en el menu
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

  return (
    <div className="home">
      <div className="home-text">
        <h1>Bienvenido!</h1>
         <h2>
            {user
              ? `${user.firstName} ${user.lastName}`
              : "Cargando nombre..."}
          </h2>
        <p>
            Gracias a nuestra plataforma podrás
            gestionar la información de alumnos,
            tutores, personal autorizado,
            supervisar la actividad diaria con total seguridad.
        </p>
        <em>
          "La tranquilidad de los padres comienza con la seguridad de sus hijos. Nosotros
          estamos aquí para apoyarle."
        </em>
      </div>
      <img  src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="Logo" className="home-image" />
    </div>
  );
}

export default Home;