import "../styles/text.css";
import "../styles/components.css";
import Layout from "../components/Layout2.jsx";
import "../styles/Students.css";
import { useState, useEffect } from "react";

import api from "../Api/axiosInstance.js";
function Students({ setView }) {

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [guardians, setGuardians] = useState([]);

  
  const token = localStorage.getItem("token");
  const school = JSON.parse(localStorage.getItem("school"));
  const schoolId = school?.id;

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);

  //para el paguinado
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 7;

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(students.length / studentsPerPage);

  // Obtener los grupos cuando ya tengamos schoolId
  useEffect(() => {
    if (!schoolId) return;

    const fetchGroups = async () => {
      try {
        const res = await api.get(`/api1/groups/${schoolId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;
        if (data.success) {
          setGroups(data.gradeSections);
        }
      } catch (error) {
        console.error("Error obteniendo grupos:", error.response?.data || error.message);
      }
    };

    fetchGroups();
  }, [schoolId]);


  // Obtener los alumnos cada vez que se cambie de grupo
  useEffect(() => {
    if (!schoolId) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api1/students/seek-school/${schoolId}/${selectedGroup}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;
        if (data.success) {
          console.log("Estudiantes encontrados:", data.data);
          setStudents(data.data);
        }
      } catch (error) {
        console.error("Error obteniendo alumnos:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [schoolId, selectedGroup]);


//Buscar a los padres del niño
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
        console.log("Estudiantes:", data.students);
        console.log("Tutores:", data.data);
        setGuardians(data.data);
      } else {
        console.warn("Error:", data.message);
      }
    } catch (error) {
      console.error("Error al consultar tutores:", error.response?.data || error.message);
    }
  };


// Editar Grupo
  const handleEditGroup = async () => {
    try {
      const res = await api.put(
        `/api1/students/edit-group/${selectedStudent}`,
        { gradeSection: selectedGroup },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;

      if (data.success) {
        setMessage("Grupo actualizado exitosamente");
        setError("");
        setTimeout(() => {
          setShowEditModal(false);
          setSelectedStudent(null);
          setSelectedGroup("All");
        }, 1500);
      } else {
        setMessage("");
        setError("Error al actualizar grupo");
      }
    } catch (error) {
      setError("Ocurrió un error al conectar con el servidor");
      setMessage("");
    }
  };


// Eliminar estudiante
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const studentId = selectedStudent.student.id;

      const res = await api.delete(`/api1/students/delete/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;

      if (res.status === 200 && data.success) {
        setMessage("Alumno Eliminado exitosamente");
        setError("");

        setStudents((prev) =>
          prev.filter((s) => s.student.id !== selectedStudent.student.id)
        );

        setTimeout(() => {
          setShowDeleteModal(false);
          setSelectedStudent(null);
        }, 1500);
      } else {
        setMessage("");
        setError("Error al actualizar grupo");
      }
    } catch (error) {
      setError("Ocurrió un error al conectar con el servidor");
      setMessage("");
    }
  };


//Modals logica

  const handleView = (studentData) => {
    setSelectedStudent(studentData);
    //console.log("School ID:", schoolId);
    //console.log("Student ID:", studentData?.student?.id);
    fetchGuardiansBySchoolAndStudent(schoolId, studentData.student.id);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedStudent(null);
  };

  const handleEdit = (group,studentId) => {
    setSelectedGroup(group);
    setSelectedStudent(studentId);
    setMessage(""); // limpiar mensaje previo
    setError(""); 
    setShowEditModal(true);
  };

  const handleModalClose = () => {
  setShowEditModal(false);
  setSelectedStudent(null);
  setSelectedGroup("All");
  setMessage("");
  setError("");
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
    setMessage(""); // limpiar mensaje previo
    setError(""); 
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  return (
    <Layout title="Gestión De Alumnos">
      <div className="Stcontainer">
        <div className="headerST">
          {/* {filtro por alumnos} */}
          <div className="students-controls">
            <div className="custom-select">
              <div className="select-header" onClick={() => setGroupDropdownOpen(!groupDropdownOpen)}>
                <span>{selectedGroup === "All" ? "Todos los grupos" : selectedGroup}</span>
                <img
                  src={`${process.env.PUBLIC_URL}/icons/triangulo.png`}
                  alt="Abrir"
                  className={`select-arrow ${groupDropdownOpen ? "rotate" : ""}`}
                />
              </div>
            {groupDropdownOpen && (
              <div className="select-options">
                <div
                  className="select-option"
                  onClick={() => {
                    setSelectedGroup("All");
                    setGroupDropdownOpen(false);
                  }}
                >
                  Todos los grupos
                </div>
                
                {groups.length > 0 ? (
                  groups.map((group, index) => (
                    <div
                      key={index}
                      className="select-option"
                      onClick={() => {
                        setSelectedGroup(group);
                        setGroupDropdownOpen(false);
                      }}
                    >
                      {group}
                    </div>
                  ))
                ) : (
                  <div className="select-option disabled">
                    <strong>No hay grupos disponibles</strong>
                    <div className="group-text">Verifica que la escuela tenga grupos asignados</div>
                  </div>
                )}
              </div>
            )}
            </div>
            <button onClick={() => setView("addStudent")} className="add-button">
              Agregar Alumno
            </button>
          </div>
        </div>
        {/* {Tabla Alumnos} */}
        <table className="students-table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>F. Nacimiento</th>
              <th>Grupo</th>
              <th>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4">Cargando...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="4">Sin alumnos disponibles</td></tr>
            ) : (
              currentStudents.map((data, i) => (
                <tr key={i}>
                  <td>{data.student.firstName} {data.student.lastName}</td>
                  <td><span className="dob-tag">{data.student.birthDate.split("T")[0]}</span></td>
                  <td>{data.gradeSection || "Sin grupo"}</td>
                  <td>
                    <div className="options">
                      <button className="btnOp">
                        <img
                          src={`${process.env.PUBLIC_URL}/icons/9.png`}
                          alt="Ver"
                          className="iconOpt"
                          onClick={() => handleView(data)}
                        />
                      </button>
                      <button className="btnOp">
                        <img
                          src={`${process.env.PUBLIC_URL}/icons/6.png`}
                          alt="Editar"
                          className="iconOpt"
                          onClick={() => handleEdit(data.gradeSection,data.student.id)}
                        />
                      </button>
                      <button className="btnOp">
                        <img
                          src={`${process.env.PUBLIC_URL}/icons/5.png`}
                          alt="Eliminar"
                          className="iconOpt"
                          onClick={() => handleDelete(data)}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* {Paginado} */}
        <div className="pagination">
          <span>Página:</span>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <span
              key={page}
              className={`page-number ${page === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </span>
          ))}
        </div>

        {/* View Modal */}
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
                  <label>{selectedStudent.student.firstName}</label><br />
                  <label>{selectedStudent.student.lastName}</label><br />
                  <label>{new Date(selectedStudent.student.birthDate).toISOString().split("T")[0]}</label><br />
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
                  <img src={`https://apidev.safekids.site/imagenes/${schoolId}/STUDENTS/${selectedStudent.student.photo}`} 
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
                <button onClick={handleCloseViewModal} className="btnConAc">Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Editar Grupo</h3>
              <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                {groups.map((group, i) => (
                  <option key={i} value={group}>{group}</option>
                ))}
              </select>
                {/* Mensajes */}
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
              <div className="modal-actions">
                <button className="btnCanAc" onClick={handleModalClose}>Cancelar</button>
                <button className="btnConAc" onClick={handleEditGroup}>Guardar</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirmar Eliminación</h3>
              <p>¿Estás seguro de que deseas eliminar al alumno <strong>{selectedStudent.student.name}</strong>?</p>
                {/* Mensajes */}
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
              <div className="modal-actions">
                <button onClick={handleCloseDeleteModal} className="btnCanAc">Cancelar</button>
                <button onClick={confirmDelete} className="btnConAc">Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Students;
