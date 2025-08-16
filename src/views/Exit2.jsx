import "../styles/text.css";
import "../styles/components.css";
import "../styles/Exit2.css";
import "../styles/Students.css"
import api from "../Api/axiosInstance.js";
import api2 from "../Api/axiosApi2";
import { useEffect, useState } from "react";

function Exit2({ setView }) {
  const token = localStorage.getItem("token");
  //console.log("Token:", token);
  const school = JSON.parse(localStorage.getItem("school"));
  const schoolId = school?.id;

  const [loading, setLoading] = useState(true);
  const [guardianData1, setGuardianData1] = useState(null);
  const [guardianData, setGuardianData] = useState(null);

  const [guardianDataRecibido, setGuardianDataRecibido] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [tipo, setTipo] = useState(null);


  const [studentData, setStudentData] = useState(null);

  const [showExitModal, setShowExitModal] = useState(false)

   //Modal padre o extra
  const [showViewModalAut, setShowViewModalAut] = useState(false);

  const handleStudentClick = (student) => {
  setSelectedStudent(student);
  setShowViewModal(true);
};

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setShowExitModal(false);
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    console.log("Hasta Luego!");
    setShowExitModal(false);
  };

  //Para cuando cierre el modal del padre y no lo encuentre
  const handleCloseViewModalTutor = () => {
  setShowViewModalAut(false);
  Inicio(); // reinicia el flujo al cerrar modal
};

  //Para cuando cierre el modal del padre y no lo encuentre
  const setShowViewModalTutorCorrect = () => {
  setShowViewModalAut(false);
  //Aqui debe de buscar a los niño
  SegundaBusqueda ();

};

const [tipoUser, setTipoUser] = useState(null);
const [IDUser, setIDUser] = useState(null);
const [parentesco, setparentescoUser] = useState(null);

const Inicio = () => {
  console.log("=== Inicio de flujo SSE + POST de padres===");

  // Abrir conexión SSE primero
  const eventSource = new EventSource(`http://159.223.195.148:8001/api2/events/${schoolId}`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    //console.log("Evento SSE recibido:", data);
        try {
      const data = JSON.parse(event.data);
      console.log("Evento SSE recibido:", data);

      // Verifica si es el evento deseado
      if (
        data?.type === "recognition_result" &&
        data?.event === "guardian_found"
      ) {
        console.log("Coincidencia encontrada, guardando datos y ejecutando salida");

        // Guardar los datos recibidos
        setGuardianDataRecibido(data.data.data);
        // Guardar archivo y tipo por separado
        setArchivo(data.data.data.archivo);
        setTipo(data.data.data.tipo);

        iniciarSalida(data.data.data.archivo, data.data.data.tipo);
      }
    } catch (err) {
      console.error("Error parseando evento SSE:", err);
    }
  };
  eventSource.onerror = (error) => {
    console.error("Error SSE:", error);
    eventSource.close();
  };
  iniciarSalida();
  return () => {
    console.log("Cerrando conexión SSE");
    eventSource.close();
  };
};

useEffect(() => {
  if (!schoolId) return;
  Inicio();
}, [schoolId]);


  // Luego hacer POST para iniciar salida
  async function iniciarSalida(archivoParam, tipoParam) {
    console.log(archivoParam, tipoParam); 

    try {
      const token = localStorage.getItem("token");
      const res = await api2.post(`/api2/iniciar-salida-escuela/${schoolId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        

      console.log("Salida iniciada:", res.data);

      //Con la imagen vamos a sacar el id
       const archivo2 = archivoParam; // e.g. "30_ANDRESLOPEZ.jpg"
      const nombreArchivo = archivo2.split(".")[0]; // "30_ANDRESLOPEZ"
      const numeroStr = nombreArchivo.split("_")[0]; // "30"
      const numberValue = parseInt(numeroStr, 10);
      console.log("Número extraído de la persona:", numberValue); 

      //const numberValue = parseInt(5);

      // Después de obtener tipo desde la API o asignarlo
      //const tipo = res.data.data.tipo; // ej. "AUTHORIZEDS" o "GUARDIANS"
      const tipo2 = tipoParam;              // actualiza el state
      //localStorage.setItem("tipoUser", tipo); // opcional: guardarlo en localStorage
      
      setIDUser(numberValue);
      if (tipoParam === "GUARDIAN") {
        // Buscar en padres
        const getRes = await api.get(`/api1/guardians/${numberValue}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (getRes.data.success) {
          console.log("Padre encontrado:", getRes.data.data);
          const parentesco1 = "Padre";
          setparentescoUser(parentesco1);
        
          //Muestra el modal
          setGuardianData1(getRes.data.data);
          setShowViewModalAut(true);
          //lleva info vista
          setGuardianData(getRes.data.data);
          // Después de obtener el parentesco y asignarlo
          //const tipo = res.data.data.tipo; // ej. "AUTHORIZEDS" o "GUARDIANS"
          const Tipo3 = tipoParam;
          setTipoUser(Tipo3 + "S");

          //Buscamos a sus niños !!!!!!!!!!!!!!!!!!!!
          const getResStudent = await api.get(`/api1/guardians/check-out-kids/GUARDIANS/${numberValue}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (getResStudent.data.success) {
          console.log("Estudiante encontrado:", getResStudent.data.data);
          setStudentData(getResStudent.data.data);
        }
          
          //setStudentData
         setLoading(false); 
        } else {
          console.error("Error al cargar padre:", getRes.data.message);
        }
      } else if (tipoParam === "AUTHORIZED") {
        // Buscar en personas autorizadas
        const getRes = await api.get(`/api1/authPeoples/show/${numberValue}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (getRes.data.success) {
          console.log("Persona autorizada encontrada:", getRes.data.data);
          setGuardianData(getRes.data.data);

          //const parentesco1 = getRes.data.data.relationship;
          const parentesco1 = "Extra";
          setparentescoUser(parentesco1);
          const Tipo3 = tipoParam;
          setTipoUser(Tipo3);

           //Buscamos a sus niños !!!!!!!!!!!!!!!!!!!!11
          const getResStudent = await api.get(`/api1/guardians/check-out-kids/GUARDIANS/${numberValue}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (getResStudent.data.success) {
          console.log("Estudiante encontrado:", getResStudent.data.data);
          setStudentData(getResStudent.data.data);
        }
         setLoading(false);


          } else {
          console.error("Error al buscar al extra:", getRes.data.message);
        }
      }
      else{
        console.error("no se esta enviando ningun tipo");
      }
    } catch (error) {
      console.error("Error iniciando salida:", error);
    }
  }



// Estados
const [guardianData2, setGuardianData2] = useState({ students: [] });
const [selectedStudent, setSelectedStudent] = useState(null);
const [showViewModal, setShowViewModal] = useState(false);

const [confirmedStudents, setConfirmedStudents] = useState([]);

// Cuando obtienes la info del estudiante
// Función para buscar estudiante
const SegundaBusqueda = async () => {
  try {
    const res3 = await api2.post(`/api2/terminar-salida-escuela${schoolId}`);
    console.log("Salida acabada:", res3.data);
    
    const res = await api2.post(`/api2/cambiar-a-estudiantes/${schoolId}`);
    console.log("Salida iniciada:", res.data);

    const archivo = res.data.data.archivo;
    const nombreArchivo = archivo.split(".")[0];
    const numeroStr = nombreArchivo.split("_")[0];
    const numberValue = parseInt(numeroStr, 10);

    console.log("Número extraído del estudiante:", numberValue);

    const token = localStorage.getItem("token");

    try {
      const getRes = await api.get(`/api1/students/${numberValue}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (getRes.data.success) {
        const studentData = getRes.data.data.student;
        console.log("Estudiante encontrado:", studentData);

        setSelectedStudent({
          name: studentData.firstName,
          lastname: studentData.lastName,
          dob: studentData.birthDate,
          photo: studentData.photo,
          group: getRes.data.data.school_name
        });

        setShowViewModal(true);
        setLoading(false);
      } else {
        console.error("Error al cargar estudiante:", getRes.data.message);
        SegundaBusqueda(); // sigue buscando aunque falle
      }
    } catch (error) {
      const data = error.response?.data;

      if (data?.message) {
        let msg = data.message;

        if (Array.isArray(data.errors)) {
          msg += "\n\nDetalles:";
          data.errors.forEach(err => {
            if (err.studentName && err.error) {
              msg += `\n- ${err.studentName}: ${err.error}`;
            }
          });
        }

        alert(msg); // Aquí puedes usar un modal en lugar de alert
      } else {
        console.error("Error desconocido al obtener estudiante:", error);
      }

      SegundaBusqueda(); // sigue buscando aunque falle
    }

  } catch (error) {
    console.error("Error iniciando salida:", error);
    SegundaBusqueda(); // sigue buscando aunque falle
  }
};


// Botón Confirmar → agrega estudiante y sigue buscando
const handleConfirmStudent = () => {
  setShowViewModal(false);
  setSelectedStudent(null);
  SegundaBusqueda(); // seguir buscando
};

// Botón Salir → solo cierra modal y sigue buscando
const handleCloseViewModalStudent = () => {
  setShowViewModal(false);
  setSelectedStudent(null);
  SegundaBusqueda(); // seguir buscando
};


//Logica de salida
const [selectedStudentIds, setSelectedStudentIds] = useState([]);

const handleCheckboxChange = (studentId, checked) => {
  setSelectedStudentIds((prev) => {
    if (checked) {
      return [...prev, studentId]; // Agregar ID si está marcado
    } else {
      return prev.filter((id) => id !== studentId); // Quitar ID si se desmarca
    }
  });
};

const handleConfirm = async () => {
  try {
    console.log("El id de persona que llegó", IDUser);
    console.log("Tipo de persona que llegó", tipoUser);
    console.log("IDs seleccionados:", selectedStudentIds);

    const normalizedType =
    tipoUser === "GUARDIANS"
      ? "GUARDIAN"
      : tipoUser === "AUTHORIZEDS"
      ? "AUTHORIZED"
      : tipoUser;

    // Validación previa
    if (!IDUser || !tipoUser || selectedStudentIds.length === 0) {
      console.error("Faltan datos para hacer el check-out");
      return;
    }

    const res = await api.post("/api1/salida/check-out",
      {
        personId: IDUser,
        personType: normalizedType,
        studentIds: selectedStudentIds
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const res2 = await api2.post(
      `/api2/terminar-salida-escuela/${schoolId}`,
      {}, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    console.log("Salida registrada correctamente al padre sele notifica", res.data);
    console.log("Salida finalizada", res2.data);
    setView("home");
  } catch (error) {
    console.error("Error al realizar el check-out:", error.response?.data || error);
  }
};

  return (
    <div className="container_2">
      {loading ? (
      <div className="modal-loading">
        <div className="modal-content3">
          <h2>Cargando datos...</h2>
        </div>
      </div>
      ) : (
        <div className="guardian-container">
          <div className="guardian-card">
            <img
                src={
                  guardianData?.photo
                    ? `https://apidev.safekids.site/imagenes/${schoolId}/${tipoUser}/${guardianData.photo}`
                    : `${process.env.PUBLIC_URL}/img/logo.png`
                }
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${process.env.PUBLIC_URL}/img/logo.png`;
                }}
                alt="Avatar"
                className="profile-img"
              />

            <div className="info2-1">
              <div className="title"><h2>Detalles</h2></div>
              <strong>Nombre:</strong>
              <p>{guardianData.firstName} {guardianData.lastName}</p>
              <strong>Parentesco:</strong> 
              <p>{parentesco}</p>
            </div>
            <button className="disabled-button" onClick={() => handleExit()}>Marcar Salida</button>
          </div>

          <div className="student-section">
            <div className="title">
              <h2>Estudiantes permitidos</h2>
            </div>
            <div className="student-list">
              <div className="student-list">
                {studentData?.students?.map((s, index) => (
                <div key={index} className="student-card" >
                    <img
                    src={
                      guardianData?.photo
                        ? `https://apidev.safekids.site/imagenes/${schoolId}/STUDENTS/${s.photo}`
                        : `${process.env.PUBLIC_URL}/img/logo.png`
                    }
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${process.env.PUBLIC_URL}/img/logo.png`;
                    }}
                    alt={`Estudiante ${index}`} 
                    className="profile-img"
                  />
                  <div className="info2-1">
                    <strong>Nombre:</strong>
                    <p>{s.fullName}</p>
                    <strong>Grupo:</strong>
                    <p>{s.gradeSection}</p>
                  </div>
                  <input className="check-input" type="checkbox" onChange={(e) => handleCheckboxChange(s.id, e.target.checked)}
                  onClick={(e) => e.stopPropagation()} />
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* {Modal ver mas informacion del padre o extra encontrado} */}
          {showViewModalAut && (
              <div className="modal-overlay">
              <div className="modal-content">
                <h2>Detalles</h2>
                <strong>¿ Corresponde la persona ?</strong>
                <div className="student-info2">
                  <div className="student-info2-1">
                    <strong>Nombre:</strong>
                    <strong>Apellido:</strong>
                    <strong>Correo:</strong>
                    <strong>Telefono:</strong>
                    <strong>Parentesco:</strong>
                  </div>
                  <div className="student-info2-2">
                    <label> {guardianData1.firstName}</label>
                    <label> {guardianData1.lastName}</label>
                    <label>{guardianData1.email}</label>
                    <label>{guardianData1.phone}</label>
                    <label >{parentesco}</label>
                  </div>
                  <div className="student-info-3">
                    <div className="imageprofile">
                      <img
                        src={`https://apidev.safekids.site/imagenes/${schoolId}/${tipoUser}/${guardianData.photo}`}
                        onError={(e) => {
                          e.target.onerror = null; // evita un bucle si también falla la imagen por defecto
                          e.target.src = `${process.env.PUBLIC_URL}/img/logo.png`;
                        }}
                        alt="Avatar"
                        className="profile-img"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-actions" >
                  <button onClick={setShowViewModalTutorCorrect}  className="btnConAc">Si</button>
                  <button onClick={handleCloseViewModalTutor} className="btnConAc">No</button>
                </div>
              </div>
            </div>
            )}

            {/*Modal para mostrar al chamaco */}
            {showViewModal && selectedStudent && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2>Información del estudiante</h2>
                  <img src={selectedStudent.photo} alt="Foto del estudiante" className="profile-img" />
                  <p><strong>Nombre:</strong> {selectedStudent.name} {selectedStudent.lastname}</p>
                  <p><strong>Fecha de nacimiento:</strong> {selectedStudent.dob}</p>
                  <p><strong>Grupo:</strong> {selectedStudent.group}</p>

                  <div className="modal-actions" >
                    <button
                      onClick={handleCloseViewModalStudent} >
                      Salir
                    </button>

                    <button
                      onClick={handleConfirmStudent}>
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            )}



          {showExitModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Confirmar Salida</h3>
                <p>
                  Verifique que las identificaciones mostradas en el sistema concuerden con las personas recién escaneadas, ya que esta acción no se puede corregir.
                </p>
                <div className="modal-actions">
                  <button onClick={handleCloseViewModal} className="btnCanAc">Cancelar</button>
                  <button  className="btnConAc" onClick={handleConfirm}>Confirmar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Exit2;

