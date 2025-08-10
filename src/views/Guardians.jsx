import "../styles/text.css";
import "../styles/components.css";
import Layout from "../components/Layout2.jsx";
import "../styles/Students.css"
import { useState, useEffect  } from "react";
import api from "../Api/axiosInstance.js";

function Guardians({ setView }) {

  const [selectedGuardian, setSelectedGuardian] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const token = localStorage.getItem("token");
  const school = JSON.parse(localStorage.getItem("school"));
  const schoolId = school?.id;
  console.log("id dela escuela :", schoolId);

  const user = JSON.parse(localStorage.getItem("user")); // convierte el string en objeto
  console.log("solo usuario:", user);
  console.log("id del usuario:", user.id);


  const [selectedGroup, setSelectedGroup] = useState("All");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [displayedStudentValue, setDisplayedStudentValue] = useState("");

  const [guardians, setGuardians] = useState([]);

  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;


  //filtros
  const handleSelectStudent = (student) => {
    setSelectedStudent(student); // Guardas el alumno seleccionado
    setStudentSearchTerm("");    // Limpias la búsqueda
    setDisplayedStudentValue(`${student.firstName} ${student.lastName} (${student.group})`); // Mostramos en input
    setDropdownOpen(false);      // Cerramos el dropdown

    fetchGuardians(student.id);
  };

    const handleView = (guardian) => {
    setSelectedGuardian(guardian);
    setShowViewModal(true);
  };

  const handleEdit = (guardian) => {
    setSelectedGuardian(guardian);
    setMessage(""); // limpiar mensaje previo
    setError(""); 
    setShowEditModal(true);
  };

  const handleDelete = (guardian) => {
    setSelectedGuardian(guardian);
    setMessage(""); // limpiar mensaje previo
    setError(""); 
    setShowDeleteModal(true);
  };

  const filteredStudents = students.filter((s) => {
  const fullName = `${s.student.firstName} ${s.student.lastName}`.toLowerCase();
  const group = s.gradeSection?.toLowerCase() || "";

  return (
    fullName.includes(studentSearchTerm.toLowerCase()) ||
    group.includes(studentSearchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    if (selectedGuardian) {
      setEditEmail(selectedGuardian.email || "");
      setEditPhone(selectedGuardian.phone || "");
    }
  }, [selectedGuardian]);

//funcion buscar estudiantes
useEffect(() => {
  if (!schoolId) return;

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api1/students/seek-school/${schoolId}/${selectedGroup}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        console.log("Estudiantes encontrados:", res.data.data);
        setStudents(res.data.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error obteniendo alumnos:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  fetchStudents();
}, [schoolId, selectedGroup]);


//funcion buscar padres
const fetchGuardians = async (studentId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await api.get(`/api1/guardians/${schoolId}/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (res.data.success) {
      console.log("Padres encontrados:", res.data.data);
      setGuardians(res.data.data);
    } else {
      console.error("Error al cargar tutores:", res.data.message);
    }
  } catch (error) {
    console.error("Error de red:", error);
  }
};

useEffect(() => {
  if (schoolId) {
    fetchGuardians("ALL");
  }
}, [schoolId]);


//funcion editar padre
const handleEditGuardian = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.put(`/api1/guardians/edit/${selectedGuardian.id}`, {
      email: editEmail,
      phone: editPhone,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 200 && res.data.success) {
      setMessage("Tutor actualizado correctamente");
      setError("");
      setTimeout(() => {
        setShowEditModal(false);
        fetchGuardians(selectedStudent?.id || "ALL");
      }, 1500);
    } else {
      setMessage("");
      setError("Error al actualizar tutor");
    }
  } catch (error) {
    setError("Ocurrió un error al conectar con el servidor");
    setMessage("");
    console.error(error);
  }
};


//funcion eliminar padre
const handleDeleteGuardian = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.delete(`/api1/guardians/delete/${selectedGuardian.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 200 && res.data.success) {
      setMessage("Tutor eliminado correctamente");
      setError("");
      setTimeout(() => {
        setShowDeleteModal(false);
        fetchGuardians(selectedStudent?.id || "ALL");
      }, 1500);
    } else {
      setError("Error al eliminar tutor");
      setMessage("");
    }
  } catch (error) {
    setError("Ocurrió un error al conectar con el servidor");
    setMessage("");
    console.error(error);
  }
};

// Lógica de paginación
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentGuardians = guardians.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(guardians.length / itemsPerPage);


  return (
    <Layout title="Gestión De Padres">
    <div className="Stcontainer">
      <div className="headerST">
        <div className="students-controls">
           {/* {filtro por alumnos} */}
          <div className="custom-select">
            <div className="custom-searchable-input">
              <input
                type="text"
                placeholder="Filtrar listado por alumno:"
                value={displayedStudentValue}
                onChange={(e) => {
                  setDisplayedStudentValue(e.target.value);      // cambia lo visible
                  setStudentSearchTerm(e.target.value);          // actualiza filtro
                }}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 300)}
                className="search-input"
              />
              <img
                src={`${process.env.PUBLIC_URL}/icons/triangulo.png`}
                alt="Desplegar"
                className={`dropdown-arrow ${dropdownOpen ? "rotate" : ""}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
            </div>
            {dropdownOpen && (
              <div className="select-options">
              
                {loading ? (
                  <div className="select-option disabled">Cargando padres...</div>
                ) : (
                  <>
                    {/* Opciones extra */}
                    <div
                      className="select-option"
                       onClick={() =>
                      handleSelectStudent({
                        id: "ALL", // Este es el valor que vas a usar en el fetch
                        firstName: "Listado",
                        lastName: "General",
                        group: "Todos",
                      })
                    }
                    >
                      <strong>Listado General</strong>
                    </div>
                     {filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => (
                        <div
                          key={s.student.id}
                          className="select-option"
                          onClick={() =>
                            handleSelectStudent({
                              ...s.student,
                              group: s.gradeSection,
                            })
                          }
                        >
                          <strong>{s.student.firstName} {s.student.lastName}</strong>
                          <div className="group-text">{s.gradeSection}</div>
                        </div>
                      ))
                    ) : (
                      <div className="select-option disabled">
                        <strong>No hay alumnos</strong>
                        <div className="group-text">Verifica el grupo o nombre</div>
                      </div>
                    )}
                          </>
                          )}
                        </div>
                      )}
          </div>
            <button onClick={() => setView("addGuardian")} className="add-button">Agregar Padre</button>
          </div>
      </div>
        {/* {Tabla padres} */}
      <table className="students-table">
        <thead>
          <tr>
            <th>Tutor</th>
            <th>Teléfono</th>
            <th>Alumno</th>
            <th>Opciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4">Cargando...</td>
            </tr>
          ) : currentGuardians.length === 0 ? (
            <tr>
              <td colSpan="4">Sin tutores disponibles</td>
            </tr>
          ) : (
            currentGuardians.map((guardian, i) => (
              <tr key={i}>
                <td>{guardian.firstName} {guardian.lastName}</td>
                <td><span className="dob-tag">{guardian.phone}</span></td>
                <td>{guardian.email}</td>
                <td>
                  <div className="options">
                    <button className="btnOp">
                      <img 
                        src={`${process.env.PUBLIC_URL}/icons/9.png`} 
                        alt="Ver" className="iconOpt"
                        onClick={() => handleView(guardian)}
                      />
                    </button>
                    <button className="btnOp">
                      <img
                        src={`${process.env.PUBLIC_URL}/icons/6.png`}
                        alt="Editar" className="iconOpt"
                        onClick={() => handleEdit(guardian)}
                      />
                    </button>
                    <button className="btnOp">
                      <img
                        src={`${process.env.PUBLIC_URL}/icons/5.png`} 
                        alt="Eliminar" className="iconOpt" 
                        onClick={() => handleDelete(guardian)}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
        {/* {paguinado} */}
      <div className="pagination">
        <span>Página</span>
        {[...Array(totalPages).keys()].map((n) => (
          <span
            key={n + 1}
            className={`page-number ${currentPage === n + 1 ? "active" : ""}`}
            onClick={() => setCurrentPage(n + 1)}
          >
            {n + 1}
          </span>
        ))}
      </div>

      {/* {Modal ver info de padre} */}
      {showViewModal && selectedGuardian && (
          <div className="modal-overlay">
          <div className="modal-content">
            <h2>Detalles</h2>
            <div className="student-info2">
              <div className="student-info2-1">
                <strong>Nombre:</strong><br />
                <strong>Apellido:</strong><br />
                <strong>Correo:</strong><br />
                <strong>Telefono:</strong><br />
                 {/* <strong>Alumnos:</strong><br /> */}
              </div>
              <div className="student-info2-2">
                <label> {selectedGuardian.firstName}</label><br />
                <label> {selectedGuardian.lastName}</label><br />
                <label>{selectedGuardian.email}</label><br />
                <label>{selectedGuardian.phone}</label><br />
                {/* <label >{selectedGuardian.studdents}</label><br /> */}
              </div>
              <div className="student-info-3">
                <div className="imageprofile" >
                  <img src={`https://apidev.safekids.site/imagenes/${schoolId}/GUARDIANS/${selectedGuardian.photo}`} 
                      onError={(e) => {
                        e.target.onerror = null; // evita un bucle si también falla la imagen por defecto
                        e.target.src = `${process.env.PUBLIC_URL}/img/logo.png`;
                      }}                    
                    alt="Avatar" className="profile-avatar" />
                </div>
               </div>
            </div>
            <div className="modal-actions" >
              <button onClick={() => setShowViewModal(false)}  className="btnConAc">Cerrar</button>
            </div>
          </div>
        </div>
        )}

      {/* {Modal editar info de padre} */}
        {showEditModal && selectedGuardian && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Editar Tutor</h2>
              <div className="student-info2">
                <div className="student-info2-1Edit">
                  <strong>Correo:</strong><br /><br />
                  <strong>Telefono:</strong><br />
                </div>
                <div className="student-info2-2">
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Email"
                  /><br />
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Teléfono"
                  /><br />
                </div>
              </div><br />
                {/* Mensajes */}
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
                <div className="modal-actions">
                  <button onClick={() => setShowEditModal(false)} className="btnCanAc">Cancelar</button>
                  <button className="btnConAc" onClick={handleEditGuardian}>Guardar</button>
                </div>
            </div>
          </div>
        )}
      
      {/* {Modal eliminar un padre} */}
        {showDeleteModal && selectedGuardian && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirmar Eliminación</h3>
              <p>¿Estás seguro de eliminar al tutor <strong>{selectedGuardian.firstName} {selectedGuardian.lastName}</strong>?</p><br />
                {/* Mensajes */}
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
              <div className="modal-actions">
                <button onClick={() => setShowDeleteModal(false)} className="btnConAc">Cancelar</button>
                <button onClick={handleDeleteGuardian} className="btnCanAc">Eliminar</button>
              </div>
            </div>
          </div>
        )}
      
    </div>
    </Layout>
  );
}

export default Guardians;
