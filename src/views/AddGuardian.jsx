import "../styles/addPadre.css";
import "../styles/text.css";
import "../styles/components.css";
import Layout from "../components/Layout2.jsx";
import { useState, useEffect  } from "react";
import api from "../Api/axiosInstance.js";
import api2 from "../Api/axiosApi2";
import * as faceapi from 'face-api.js';


function AddGuardian({ setView }) {

  const token = localStorage.getItem("token");
  //console.log("Token guardado:", token);
  //console.log("Token:", token);
  const school = JSON.parse(localStorage.getItem("school"));
  const schoolId = school?.id;
  //console.log("escuela", schoolId)

  const user = localStorage.getItem("user");
  //console.log("usuario:", user);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  //boton accion
  const [isDisabled, setIsDisabled] = useState(false);

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
    setIsDisabled(true); // bloquea el botón

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("photo", photo);

    //Validaciones para el formulario
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

    //Enviar formulario
    try {
      const res = await api.post(`/api1/guardians/register/${schoolId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        const guardianId = res.data.data.id;
      //console.log("ID del tutor:", guardianId);
      //console.log("datos nuevos",res.data);
      //console.log("datos nuevos usables",schoolId, guardianId, res.data.data.firstName, res.data.data.lastName,res.data.data.photo );
        
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
      
      //Usamos la api2 para crear la carpeta y para guardar la imagen
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

        // Resetear campos del formulario
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

//Validaciones Expesificas para la imagen
  useEffect(() => {
    async function loadModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri("models");
    }
    loadModels();
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }

    setError("");
    setPhoto(null);

    try {
      const img = await faceapi.bufferToImage(file);

      const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());
        
      if (!Array.isArray(detections) || detections.length !== 1) {
        setError("La imagen debe contener exactamente un rostro visible y bien definido.");
        return;
      }

      const faceBox = detections[0].box;
      const minSide = Math.min(img.width, img.height);
      if (faceBox.width < minSide * 0.2 || faceBox.height < minSide * 0.2) {
        setError("El rostro es demasiado pequeño en la imagen.");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      function laplacianVariance(imageData, width, height) {
        const kernel = [0,1,0,1,-4,1,0,1,0];
        const gray = [];
        for(let i=0; i<imageData.data.length; i+=4) {
          gray.push(imageData.data[i]);
        }

        let varianceArr = [];
        for(let y=1; y<height-1; y++) {
          for(let x=1; x<width-1; x++) {
            let sum = 0;
            let k = 0;
            for(let ky=-1; ky<=1; ky++) {
              for(let kx=-1; kx<=1; kx++) {
                const px = x + kx;
                const py = y + ky;
                const idx = py*width + px;
                sum += gray[idx] * kernel[k];
                k++;
              }
            }
            varianceArr.push(sum);
          }
        }
        const mean = varianceArr.reduce((a,b) => a+b,0) / varianceArr.length;
        const variance = varianceArr.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / varianceArr.length;
        return variance;
      }

      const laplacianVar = laplacianVariance(imageData, img.width, img.height);
      if(laplacianVar <30) {
        setError("La imagen está borrosa.");
        return;
      }

      // Brillo promedio (canal rojo)
      const meanBrightness = imageData.data.reduce((acc, val, idx) => {
        if(idx % 4 === 0) return acc + val;
        else return acc;
      }, 0) / (imageData.data.length / 4);

      if (meanBrightness < 50) {
        setError("La imagen está demasiado oscura.");
        return;
      }
      if (meanBrightness > 230) {
        setError("La imagen está demasiado clara.");
        return;
      }

      setPhoto(file);

    } catch (err) {
      console.error("Error procesando imagen:", err);
      setError("Error al analizar la imagen.");
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
            <input type="file" onChange={handlePhotoChange}/>
          </div>
          {/* Mensajes */}
            {message && <p className="success-messageEdit">{message}</p>}
            {error && <p className="error-messageEdit">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="add-button-user" disabled={isDisabled}>Añadir Tutor</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AddGuardian;
