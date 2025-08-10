import "../styles/text.css";
import "../styles/components.css";
import "../styles/Exit2.css";
import "../styles/Students.css"
import { useEffect, useState } from "react";

function Exit2() {
  const [loading, setLoading] = useState(true);
  const [guardianData, setGuardianData] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false)

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


useEffect(() => {
  setTimeout(() => {
    setGuardianData({
      name: "Mia Winters",
      relation: "Madre",
      photo: `${process.env.PUBLIC_URL}/img/10.png`,
      students: [
        {
          name: "Rose Mary Winters",
          lastname: "Monarrez Duran",
          group: "6-B",
          photo: `${process.env.PUBLIC_URL}/img/11.png`,
          dob: "20 jun 2004",
        },
        {
          name: "andrea Mar",
          lastname: "Monarrez Duran",
          group: "5-C",
          photo: `${process.env.PUBLIC_URL}/img/11.png`,
          dob: "20 Dic 2002",
        }
      ]
    });
    setLoading(false);
  }, 1000);
}, []);


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
            <img src={guardianData.photo} alt="Tutor" className="profile-img" />
            <div className="info2-1">
              <div className="title"><h2>Detalles</h2></div>
              <strong>Nombre:</strong>
              <p>{guardianData.name}</p>
              <strong>Parentesco:</strong> 
              <p>{guardianData.relation}</p>
            </div>
            <button className="disabled-button" onClick={() => handleExit()}>Marcar Salida</button>
          </div>

          <div className="student-section">
            <div className="title">
              <h2>Estudiantes permitidos</h2>
            </div>
            <div className="student-list">
              {guardianData.students.map((s, index) => (
                <div key={index} className="student-card" onClick={() => handleStudentClick(s)} >
                  <img src={s.photo} alt={`Estudiante ${index}`} className="profile-img" />
                  <div className="info2-1">
                    <strong>Nombre:</strong>
                    <p>{s.name}</p>
                    <strong>Grupo:</strong>
                    <p>{s.group}</p>
                  </div>
                  <input className="check-input" type="checkbox"  onClick={(e) => e.stopPropagation()}/>
                </div>
              ))}
            </div>
          </div>

          {showViewModal && selectedStudent && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Estudiante indentificado</h2>
                <div className="student-info2">
                  <div className="student-info2-1">
                    <strong>Nombre:</strong>
                    <strong>Apellido:</strong>
                    <strong>Fecha de nacimiento:</strong>
                    <strong>Tutor 1:</strong>
                    <strong>Tutor 2:</strong>
                  </div>
                  <div className="student-info2-2">
                    <label>{selectedStudent.name}</label>
                    <label>{selectedStudent.lastname}</label>
                    <label>{selectedStudent.dob}</label>
                    <label>Hal Wilkerson</label>
                    <label>Loise Wilkerson</label>
                  </div>
                  <div className="student-info-3">
                    <div className="imageprofile">
                      <img src={selectedStudent.photo} className="profile-img" />
                    </div>
                    <label>{selectedStudent.group}</label>
                  </div>
                </div>

                <div className="modal-actions" style={{ justifyContent: "center" }}>
                  <button onClick={handleCloseViewModal} className="btnConAc">Cerrar</button>
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
                  <button  className="btnConAc">Confirmar</button>
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

