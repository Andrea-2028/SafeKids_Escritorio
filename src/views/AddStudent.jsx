import "../styles/AddStudent.css";
import "../styles/text.css";
import "../styles/components.css";
import Layout from "../components/Layout2.jsx";
import { useState, useEffect } from "react";
import api from "../Api/axiosInstance.js";
import api2 from "../Api/axiosApi2";
import * as faceapi from 'face-api.js';

function AddStudent({ setView }) {

  const token = localStorage.getItem("token");
  //console.log("Token:", token);
  const school = JSON.parse(localStorage.getItem("school"));
  const schoolId = school?.id;
  const studentId = 'ALL'; 

  const [searchTerm1, setSearchTerm1] = useState('');
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [selectedTutor1, setSelectedTutor1] = useState(null);

  const [searchTerm2, setSearchTerm2] = useState('');
  const [showDropdown2, setShowDropdown2] = useState(false);
  const [selectedTutor2, setSelectedTutor2] = useState(null);

  const [tutors, setTutors] = useState([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [photo, setPhoto] = useState(null);
  const [gradeSection, setGradeSection] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  //Filtros de tutores
  const filteredTutors1 = tutors.filter((tutor) => {
    const fullName = `${tutor.firstName} ${tutor.lastName}`.toLowerCase();
  
    return (
      fullName.includes(searchTerm1.toLowerCase()) ||
      (tutor.email && tutor.email.toLowerCase().includes(searchTerm1.toLowerCase()))
    );
  });

  const filteredTutors2 = tutors.filter((tutor) => {
    const fullName = `${tutor.firstName} ${tutor.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm2.toLowerCase()) ||
      (tutor.email && tutor.email.toLowerCase().includes(searchTerm2.toLowerCase()))
    );
  });

  const selectTutor1 = (tutor) => {
    console.log("Tutor seleccionado:", tutor);
    setSearchTerm1(`${tutor.firstName} ${tutor.lastName}`);
    setSelectedTutor1(tutor);
    setShowDropdown1(false);
  };

  const selectTutor2 = (tutor) => {
    console.log("Tutor 2 seleccionado:", tutor);
    setSearchTerm2(`${tutor.firstName} ${tutor.lastName}`);
    setSelectedTutor2(tutor);
    setShowDropdown2(false);
  };

//funcion traer padres
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await api.get(`/api1/guardians/${schoolId}/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = response.data;

        if (data.success) {
          setTutors(data.data); // Lista de tutores activos
        } else {
          console.error("Error al obtener tutores:", data.message);
        }
      } catch (error) {
        console.error("Error en la petición:", error);
      }
    };

    if (schoolId) {
      fetchTutors();
    }
  }, [schoolId]);


 //funcion crear
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTutor1 || !selectedTutor1.id) {
      alert("Selecciona al menos un tutor");
      return;
    }

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("birthDate", birthDate);
    formData.append("photo", photo);
    formData.append("gradeSection", gradeSection);

    const guardianIds = [selectedTutor1.id];
    if (selectedTutor2?.id && selectedTutor2.id !== selectedTutor1.id) {
      guardianIds.push(selectedTutor2.id);
    }

    guardianIds.forEach((id, index) => {
      formData.append(`guardianIds[${index}]`, id);
    });
    
    if (!firstName || firstName.length > 100) {
    setError("El nombre es obligatorio y debe tener máximo 100 caracteres.");
    return;
  }
  if (!lastName || lastName.length > 100) {
    setError("El apellido es obligatorio y debe tener máximo 100 caracteres.");
    return;
  }
  if (!birthDate) {
    setError("La fecha de nacimiento es obligatoria.");
    return;
  }
  if (!gradeSection || gradeSection.length > 50) {
    setError("El grupo es obligatorio y debe tener máximo 50 caracteres.");
    return;
  }
  if (!photo) {
    setError("La foto es obligatoria.");
    return;
  }
  if (photo.size > 2 * 1024 * 1024) {
    setError("La imagen no debe pesar más de 2MB.");
    return;
  }
  const validTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!validTypes.includes(photo.type)) {
    setError("La imagen debe estar en formato JPG o PNG.");
    return;
  }

  // Validar tutores
  if (guardianIds.length === 0) {
    setError("Debes seleccionar al menos un tutor.");
    return;
  }
  if (guardianIds.length > 2) {
    setError("Solo puedes seleccionar máximo 2 tutores.");
    return;
  }
  const uniqueIds = new Set(guardianIds);
  if (uniqueIds.size !== guardianIds.length) {
    setError("Los tutores seleccionados deben ser diferentes.");
    return;
  }

    try {
      const token = localStorage.getItem("token");
      const res = await api.post(`/api1/students/create/${schoolId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;

      if (res.status === 200 || data.success) {
        console.log(data);
        setMessage("Alumno creado correctamente");

  // Segunda petición al otro backend (api2)
      console.log("datos nuevos",res.data);
      const studentId = res.data.data.student.id;
      console.log("ID del del alumno:", studentId);
      

      const formData1= new FormData();
      formData1.append("school_id", schoolId);

      const formData2 = new FormData();
      formData2.append("school_id", schoolId);
      formData2.append("id", studentId);
      formData2.append("firstName", res.data.data.student.firstName);
      formData2.append("lastName", res.data.data.student.lastName);
      formData2.append("file", photo); // ya es un archivo

      for (let pair of formData2.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
      }

      try {
        await api2.post("/api2/crear/escuela", formData1);
        const res2 = await api2.post(`/api2/upload/students`, formData2, {
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


        setError("");
        setTimeout(() => {
          setView("students");
        }, 1500);
      } else {
        console.error("Error en validación:", data.errors);
        alert(data.message || "Error al crear el alumno");
      }
    } catch (err) {
      console.error("Error en la petición:", err);
      alert("Error en la conexión");
    }
  };

//lo de las imagenes

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
    <Layout title="Añadir Alumno">
      <div className="add-student-container">
        <form className="add-student-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input type="text"  value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ej. Hermione Morelia" />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Ej. Chavarría Lara" />
          </div>
          <div className="form-group">
            <label>F. De Nacimiento</label>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}/>
          </div>
          <div className="form-group">
            <label>Imagen</label>
            <input type="file"  onChange={handlePhotoChange}/>
          </div>
          {/* {Seleccion de padres} */}
          <div className="form-group searchable-dropdown">
            <label>Seleccionar Tutor 1</label>
            <div className="custom-searchable-input">
              <input
                type="text"
                placeholder="Seleccionar Una Opción"
                value={searchTerm1}
                onChange={(e) => setSearchTerm1(e.target.value)}
                onFocus={() => setShowDropdown1(true)}
                onBlur={() => setTimeout(() => setShowDropdown1(false), 300)}
              />
              <img
                src={`${process.env.PUBLIC_URL}/icons/triangulo.png`}
                alt="Desplegar"
                className="dropdown-arrow"
              />
            </div>
            {showDropdown1 && (
              <div className="dropdown-options">
                {filteredTutors1.map((tutor, i) => (
                  <div key={i} className="dropdown-option" onClick={() => {console.log("Tutor seleccionado:", tutor); selectTutor1(tutor)}}>
                    <strong>{tutor.firstName} {tutor.lastName}</strong><br />
                    <span className="tutor-email">{tutor.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-group searchable-dropdown">
            <label>Seleccionar Tutor 2</label>
            <div className="custom-searchable-input">
              <input
                type="text"
                placeholder="Seleccionar Una Opción"
                value={searchTerm2}
                onChange={(e) => setSearchTerm2(e.target.value)}
                onFocus={() => setShowDropdown2(true)}
                onBlur={() => setTimeout(() => setShowDropdown2(false), 300)}
              />
              <img
                src={`${process.env.PUBLIC_URL}/icons/triangulo.png`}
                alt="Desplegar"
                className="dropdown-arrow"
              />
            </div>
            {showDropdown2 && (
              <div className="dropdown-options">
                {filteredTutors2.map((tutor, i) => (
                  <div key={i} className="dropdown-option" onClick={() => selectTutor2(tutor)}>
                    <strong>{tutor.firstName} {tutor.lastName}</strong><br />
                    <span className="tutor-email">{tutor.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Grupo</label>
            <input type="text" value={gradeSection} onChange={(e) => setGradeSection(e.target.value)} placeholder="Ej. 1-A" />
          </div>
            {/* Mensajes */}
            {message && <p className="success-messageEdit">{message}</p>}
            {error && <p className="error-messageEdit">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="add-button-user">Añadir Alumno</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AddStudent;
