import "../styles/text.css";
import "../styles/components.css";
import "../styles/Exit2.css";
import "../styles/Students.css";
import api from "../Api/axiosInstance.js";
import api2 from "../Api/axiosApi2";
import { useEffect, useState, useRef } from "react";

function Exit2({ setView }) {
  const token = localStorage.getItem("token");
  //console.log("Token:", token);
  const school = JSON.parse(localStorage.getItem("school"));
  const schoolId = school?.id;

  const [loading, setLoading] = useState(true);
  const [guardianData1, setGuardianData1] = useState(null);
  const [guardianData, setGuardianData] = useState(null);


  const [studentData, setStudentData] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);

   //Modal padre o extra
  const [showViewModalAut, setShowViewModalAut] = useState(false);
    

  //Modal estudiante
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [guardians, setGuardians] = useState([]);

    const handleCloseViewModalEstudent = () => {
    setShowViewModal (false);
  };

  //Para cuando cierre el modal del padre y no corresponda
  const handleCloseViewModalTutor = () => {
  setShowViewModalAut(false);
  setLoading(true); 
  Inicio(); // reinicia el flujo al cerrar modal
};

  //Para cuando cierre el modal del padre y si corresponda
  const setShowViewModalTutorCorrect = () => {
  setShowViewModalAut(false);
  setShowViewModal (true);
};

const [tipoUser, setTipoUser] = useState(null);
const [IDUser, setIDUser] = useState(null);
const [parentesco, setparentescoUser] = useState(null);


//variables para el evento de sse
const eventSourceRef = useRef(null);

const Inicio = () => {
  console.log("=== Inicio de flujo SSE ===");
  //iniciarSalida("5_CARLOSFERNANDEZ.jpg" ,"GUARDIAN");
  // Abrir conexión SSE primero
  eventSourceRef.current = new EventSource(`http://159.223.195.148:8001/api2/events/${schoolId}`);
  eventSourceRef.current.onmessage = (event) => {
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
        console.log("Coincidencia de GUARDIAN encontrada, guardando datos y ejecutando salida");
        iniciarSalida(data.data.data.archivo, data.data.data.tipo);

      }
      if(data?.type === "recognition_result" &&
        data?.event === "authorized_found")
        {
          console.log("Coincidencia de Persona Autorizada encontrada, guardando datos y ejecutando salida");
          iniciarSalida(data.data.data.archivo, data.data.data.tipo);
        }
      // === Caso: se encontró un STUDENT ===
    if (data?.type === "recognition_result" && data?.event === "student_found") {
      console.log("Coincidencia de STUDENT encontrada");
      // Llamar a tu segunda búsqueda
      SegundaBusqueda(data.data.data.archivo);
    }
    } catch (err) {
      console.error("Error parseando evento SSE:", err);
    }
  };
   eventSourceRef.current.onerror = (error) => {
    console.error("Error SSE:", error);
    eventSourceRef.current.close();
  };
};

useEffect(() => {
  if (!schoolId) return;
  Inicio();
}, [schoolId]);
  
  async function iniciarSalida(archivoParam, tipoParam) {
    
    console.log(archivoParam, tipoParam); 
    try {
      const token = localStorage.getItem("token");
      // Luego hacer POST para iniciar bsuqueda del padre o extra
      const res = await api2.post(`/api2/iniciar-salida-escuela/${schoolId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        
      console.log("Salida iniciada:", res.data);
      //Con la imagen vamos a sacar el id
       const archivo2 = archivoParam; // e.g. "5_CARLOSFERNANDEZ.jpg
      const nombreArchivo = archivo2.split(".")[0]; // "5_CARLOSFERNANDEZ"
      const numeroStr = nombreArchivo.split("_")[0]; // "5"
      const numberValue = parseInt(numeroStr, 10);
      console.log("Número extraído de la persona:", numberValue); 

      //const tipo = res.data.data.tipo; // ej. "AUTHORIZED" o "GUARDIAN"
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
        
          //Muestra el modal del padre
          setGuardianData1(getRes.data.data);
          setShowViewModalAut(true);
          //lleva info vista
          setGuardianData(getRes.data.data);
          // Después de obtener el parentesco y asignarlo
          // mandar el tipo a la imagen
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
          console.log("Estudiantes encontrados:", getResStudent.data.data);
          setStudentData(getResStudent.data.data);

          // Luego cambiamos el estado de la busqueda para los niños 
          //cambia el estado de busqueda a students para SSE
          const resEs = await api2.post(`/api2/cambiar-a-estudiantes/${schoolId}`);
          console.log("Busqueda los niños por camara inciada:", resEs.data);

          //SegundaBusqueda ("1_LAURAFERNANDEZ.jpg")

        }
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
          const getResStudent = await api.get(`/api1/guardians/check-out-kids/AUTHORIZEDS/${numberValue}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (getResStudent.data.success) {
          console.log("Estudiante encontrado:", getResStudent.data.data);
          setStudentData(getResStudent.data.data);
          //cambia el estado de busqueda a students para SSE
          const resEs = await api2.post(`/api2/cambiar-a-estudiantes/${schoolId}`);
          console.log("Salida iniciada:", resEs.data);

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

// Cuando obtienes la info del estudiante
// Función para buscar estudiante
const SegundaBusqueda = async (archivoParam) => {
  try {
    const archivo = archivoParam;
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
        setSelectedStudent(studentData);
        fetchGuardiansBySchoolAndStudent(schoolId, studentData.id);
        
      } else {
        console.error("Error al cargar estudiante:", getRes.data.message);
      }
    } catch (error) {
      const data = error.response?.data;
      if (data?.message) {
        alert("error"); // Aquí puedes usar un modal en lugar de alert
      } else {
        console.error("Error desconocido al obtener estudiante:", error);
      }
    }
  } catch (error) {
    console.error("Error iniciando salida:", error);
  }
};

//Buscar a los padres del niño para mostrarlos en el modal
  const fetchGuardiansBySchoolAndStudent = async (schoolId, studentId) => {
    try {
      const res = await api.get(`/api1/guardians/${schoolId}/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;
      if (data.success) {
        console.log("Mensaje:", data.message);
        console.log("Estudiante:", data.students);
        console.log("Tutores:", data.data);
        setGuardians(data.data);
        
      } else {
        console.warn("Error:", data.message);
      }
    } catch (error) {
      console.error("Error al consultar tutores:", error.response?.data || error.message);
    }
  };

//Logica de salida

//mostrar model de salida
  const handleExit = () => {
    setShowExitModal(true);
  };

//Cerrar el modal de salida
  const handleCloseViewModal = () => {
    setShowExitModal(false);
  };

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
//Cerrar el modal de salida y marcar salida de estudiantes con el padre o extra
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

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current.onmessage = null;
      eventSourceRef.current.onerror = null;
      eventSourceRef.current.onopen = null;
      console.log("=== Conexión SSE cerrada manualmente ===");
      eventSourceRef.current = null;
    }

    setShowExitModal(false); 
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
                    <strong>Nombre:</strong><br />
                    <strong>Apellido:</strong><br />
                    <strong>Correo:</strong><br />
                    <strong>Telefono:</strong><br />
                    <strong>Parentesco:</strong><br />
                  </div>
                  <div className="student-info2-2">
                    <label> {guardianData1.firstName}</label><br />
                    <label> {guardianData1.lastName}</label><br />
                    <label>{guardianData1.email}</label><br />
                    <label>{guardianData1.phone}</label><br />
                    <label >{parentesco}</label><br />
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
                </div><br />
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
              <h2>Detalles</h2>
              <div className="student-info2">
                <div className="student-info2-1">
                  <strong>Nombre:</strong><br />
                  <strong>Apellido:</strong><br />
                  <strong>Fecha de nacimiento:</strong><br />
                  <strong>Tutor 1:</strong><br />
                  <strong>Tutor 2:</strong><br />
                </div>
                <div className="student-info2-2">
                  <label>{selectedStudent.firstName}</label><br />
                  <label>{selectedStudent.lastName}</label><br />
                  <label>{new Date(selectedStudent.birthDate).toISOString().split("T")[0]}</label><br />
                  {guardians.length > 0 ? (
                    <>
                      <label>{guardians[0]?.firstName} {guardians[0]?.lastName}</label><br />
                      <label>{guardians[1]?.firstName} {guardians[1]?.lastName}</label><br />
                    </>
                  ) : (
                    <>
                      <label>Sin tutor registrado</label><br />
                      <label>Sin tutor registrado</label><br />
                    </>
                  )}

                </div>
                <div className="student-info-3">
                  <div className="imageprofile">
                  <img src={`https://apidev.safekids.site/imagenes/${schoolId}/STUDENTS/${selectedStudent.photo}`} 
                      onError={(e) => {
                        e.target.onerror = null; // evita un bucle si también falla la imagen por defecto
                        e.target.src = `${process.env.PUBLIC_URL}/img/logo.png`;
                      }}
                    alt="Avatar" className="profile-avatar" />
                  </div>
                  <label>{selectedStudent.gradeSection}</label>
                </div>
              </div>
              <div className="modal-actions" style={{ justifyContent: "center" }}>
                <button className="btnConAc" onClick={handleCloseViewModalEstudent}>Cerrar</button>
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

