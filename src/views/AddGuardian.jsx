import "../styles/addPadre.css";
import "../styles/text.css";
import "../styles/components.css";
import Layout from "../components/Layout2.jsx";
import { useState, useEffect  } from "react";
import api from "../Api/axiosInstance.js";
import api2 from "../Api/axiosApi2";

function AddGuardian({ setView }) {

  const token = localStorage.getItem("token");
      console.log("Token guardado:", token);
  //console.log("Token:", token);
  const school = JSON.parse(localStorage.getItem("school"));
  const schoolId = school?.id;
     console.log("escuela", schoolId)

     const user = localStorage.getItem("user");
      console.log("usuario:", user);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState(null);

  //funcion agregar padre
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setMessage("");

  const formData = new FormData();
  formData.append("firstName", firstName);
  formData.append("lastName", lastName);
  formData.append("phone", phone);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("photo", photo);

  if (!firstName || !lastName || !phone || !email || !password || !photo) {
  setError("Todos los campos son obligatorios.");
  return;
}

if (!/^\d{10}$/.test(phone)) {
  setError("El teléfono debe tener 10 dígitos numéricos.");
  return;
}

if (password.length < 8) {
  setError("La contraseña debe tener al menos 8 caracteres.");
  return;
}

if (!/\S+@\S+\.\S+/.test(email)) {
  setError("El correo no es válido.");
  return;
}

const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
if (!allowedTypes.includes(photo.type)) {
  setError("La imagen debe ser .jpg, .jpeg o .png");
  return;
}

if (photo.size > 2 * 1024 * 1024) {
  setError("La imagen no debe pesar más de 2MB.");
  return;
}

  try {
    const res = await api.post(`/api1/guardians/register/${schoolId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data.success) {
      const guardianId = res.data.data.id;
      console.log("ID del tutor:", guardianId);

      console.log("datos nuevos",res.data);
      console.log("datos nuevos usables",schoolId, guardianId, res.data.data.firstName, res.data.data.lastName,res.data.data.photo );
      
      setMessage("Tutor añadido correctamente.");
    // Segunda petición al otro backend (api2)
    const formData1= new FormData();
    formData1.append("school_id", schoolId);

    const formData2 = new FormData();
    formData2.append("school_id", schoolId);
    formData2.append("id", guardianId);
    formData2.append("firstName", res.data.data.firstName);
    formData2.append("lastName", res.data.data.lastName);
    formData2.append("file", photo); // ya es un archivo

    for (let pair of formData2.entries()) {
    console.log(`${pair[0]}:`, pair[1]);
    }
    
    try {
      await api2.post("/api2/crear/escuela", formData1);
      const res2 = await api2.post(`/api2/upload/guardians`, formData2, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      if (!res2.data.success) {
        setError(res2.data.message || "Error al subir imagen");
        return;
      }
    } catch (error) {
      setError("Error de conexión con el servidor API2");
      console.error(error);
      return;
    }

      // Resetear campos
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setPhoto(null);
      setTimeout(() => {
      setView("guardians");
      }, 1500);

    } else {
      setError(res.data.message || "Error al añadir tutor");
    }

  } catch (error) {
    setError("Error de conexión con el servidor");
    console.error(error);
  }
};


  return (
    <Layout title="Añadir Tutor">
      <div className="add-Guardian-container">
        <form className="add-student-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" placeholder="Ej. Hermione Morelia" value={firstName} onChange={e => setFirstName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Contraseña Inicial</label>
                <input placeholder="Nueva contraseña" className="input-editable" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input type="text" placeholder="Ej. Monarrez Duran" value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Telefono</label>
            <input type="text" placeholder="Ej. 8713344172" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Correo</label>
            <input type="text" placeholder="Ej. vamonarrez@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Imagen</label>
            <input type="file" onChange={e => setPhoto(e.target.files[0])} />
          </div>
          {/* Mensajes */}
            {message && <p className="success-messageEdit">{message}</p>}
            {error && <p className="error-messageEdit">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="add-button-user">Añadir Tutor</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AddGuardian;
