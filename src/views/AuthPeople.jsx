import "../styles/text.css";
import "../styles/components.css";
import Layout from "../components/Layout2.jsx";
import "../styles/Students.css"
import { useState, useEffect  } from "react";
import api from '../Api/axiosInstance.js';


function AuthorizedPeople() {

  const [selectedAuthPeople, setSelectedAuthPeople] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const token = localStorage.getItem("token");
  const school = JSON.parse(localStorage.getItem("school"));
  const schoolId = school?.id;

    const handleView = (authPeoples) => {
    setSelectedAuthPeople(authPeoples);
    setShowViewModal(true);
  };

  const [authPeoples, setGuardians] = useState([]);

  const [displayedStudentValue, setDisplayedStudentValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");


  const handleSelectStudent = (student) => {
    setSelectedStudent(student); // Guardas el alumno seleccionado
    setStudentSearchTerm("");    // Limpias la búsqueda
    setDisplayedStudentValue(`${student.firstName} ${student.lastName} (${student.group})`); // Mostramos en input
    setDropdownOpen(false);      // Cerramos el dropdown
    
    fetchAuthPeople(student.id);
  };

  const filteredStudents = students.filter((s) => {
  const fullName = `${s.student.firstName} ${s.student.lastName}`.toLowerCase();
  const group = s.gradeSection?.toLowerCase() || "";

  return (
    fullName.includes(studentSearchTerm.toLowerCase()) ||
    group.includes(studentSearchTerm.toLowerCase())
    );
  });

//Funcion mostrar estudiantes
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


//Funcion mostrar personas autorizadas

  const fetchAuthPeople = async (studentId) => {
    try {
      const res = await api.get(`/api1/authPeoples/${schoolId}/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        console.log("Tutores encontrados:", res.data.data);
        const formatted = res.data.data.map((item) => {
          const { authorized_person, students } = item;
          return {
            ...authorized_person,
            studdents: students
              .map((s) => `${s.firstName} ${s.lastName} (${s.gradeSection})`)
              .join(", "),
          };
        });

        setGuardians(formatted);
      } else {
        setGuardians([]);
      }
    } catch (error) {
      console.error("Error obteniendo tutores:", error);
      setGuardians([]);
    }
  };


useEffect(() => {
  if (schoolId) {
    fetchAuthPeople("ALL");
  }
}, [schoolId]);

// Lógica de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAuthPeople = authPeoples.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(authPeoples.length / itemsPerPage);

  return (
    <Layout title="Gestión De Personal Autorizado">
    <div className="Stcontainer">
      <div className="headerST">
        {/* {filtro por alumnos} */}
        <div className="students-controls">
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
                  <div className="select-option disabled">Cargando alumnos...</div>
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
                    {/*Aqui se podra poner
                    <div
                      className="select-option"
                        onClick={() =>
                          handleSelectStudent({
                            id: "NONE", // Esto se usa para decir que quieres tutores sin alumno
                            firstName: "Sin",
                            lastName: "Alumno",
                            group: "",
                          })
                        }
                    >
                      <strong>Sin alumno</strong>
                    </div> */}
                    
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
        </div>
      </div>
      {/* {Tabla Personas autorizadas} */}
      <table className="students-table">
        <thead>
          <tr>
            <th>Tutor</th>
            <th>Telefono</th>
            <th>Alumno</th>
            <th>Opciones</th>
          </tr>
        </thead>
        <tbody>
          {currentAuthPeople.map((authPeople, i) => (
            <tr key={i}>
              <td>{authPeople.firstName} {authPeople.lastName}</td>
              <td><span className="dob-tag">{authPeople.phone}</span></td>
              <td>{authPeople.studdents}</td>
              <td>
                <div className="options">
                  <button className="btnOp"><img 
                    src={`${process.env.PUBLIC_URL}/icons/9.png`} 
                    alt="Ver" className="iconOpt"
                    onClick={() => handleView(authPeople)}
                    /></button> 
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* {Paguinado} */}
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

      {/* {Modal ver mas informacion} */}
      {showViewModal && selectedAuthPeople && (
          <div className="modal-overlay">
          <div className="modal-content">
            <h2>Detalles</h2>
            <div className="student-info2">
              <div className="student-info2-1">
                <strong>Nombre:</strong>
                <strong>Apellido:</strong>
                <strong>Telefono:</strong>
                <strong>Alumnos:</strong>
              </div>
              <div className="student-info2-2">
                <label> {selectedAuthPeople.firstName}</label>
                <label> {selectedAuthPeople.lastName}</label>
                <label>{selectedAuthPeople.phone}</label>
                <label >{selectedAuthPeople.studdents}</label>
              </div>
              <div className="student-info-3">
                <div className="imageprofile">
                  <img src={`https://apidev.safekids.site/imagenes/${schoolId}/AUTHORIZEDS/${selectedAuthPeople.photo}`} 
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
        
    </div>
    </Layout>
  );
}

export default AuthorizedPeople;
