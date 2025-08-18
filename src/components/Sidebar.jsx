import "../components/Sidebar.css";
function Sidebar({ setView }) {
  return (
    <div className="sidebar">
      <button onClick={() => setView("home")}> 
        <img src={`${process.env.PUBLIC_URL}/icons/2.png`} alt="home" className="icon" /> <br /> Inicio
      </button>
      <button onClick={() => setView("profile")}> 
        <img src={`${process.env.PUBLIC_URL}/icons/1.png`} alt="profile" className="icon" /> <br /> Mi Perfil
      </button>
      <button onClick={() => setView("guardians")}> 
        <img src={`${process.env.PUBLIC_URL}/icons/4.png`} alt="guardians" className="icon" /> <br /> Padres de familia
      </button>
      <button onClick={() => setView("students")}> 
        <img src={`${process.env.PUBLIC_URL}/icons/3.png`} alt="students" className="icon" /> <br /> Alumnos
      </button>
      <button onClick={() => setView("authPeople")}> 
        <img src={`${process.env.PUBLIC_URL}/icons/7.png`} alt="authorizedPeople" className="icon" /> <br />  Personal Autorizado
      </button>
      <button  onClick={() => setView("exit")}> 
        <img src={`${process.env.PUBLIC_URL}/icons/8.png`} alt="exit" className="icon" /> <br /> Salida
      </button>
    </div>
  );
}

export default Sidebar;
