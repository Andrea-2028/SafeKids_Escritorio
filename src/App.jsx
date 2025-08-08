import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./views/Home";
import Profile from "./views/Profile";
import EditProfile from "./views/EditProfile";
import Students from "./views/Students.jsx";
import AddStudent from "./views/AddStudent.jsx";
import Guardians from "./views/Guardians.jsx";
import AddGuardian from "./views/AddGuardian.jsx";
import AuthPeople from "./views/AuthPeople.jsx";
import Exit from "./views/Exit.jsx"
import Exit2 from "./views/Exit2.jsx"

import Login from "./views/Login.jsx"
import RecoverEmail from "./views/RecoverEmail.jsx"
import RecoverCode from "./views/RecoverCode.jsx"
import ResetPassword from "./views/ResetPassword.jsx"
import SecondFactor from "./views/SecondFactor.jsx"

function App() {
  const [view, setView] = useState("login");

  return (
    <div className="main-container">
      {/* Solo muestra el sidebar si NO estamos en la vista de login */}
      {view !== "login" && view !== "recoverEmail"  && view !== "recoverCode" && view !== "resetPassword" && view !== "secondFactor"  && <Sidebar setView={setView} />}


      <div className="content-container">
        {view === "login" && <Login setView={setView} />}
        {view === "recoverEmail" && <RecoverEmail setView={setView} />}
        {view === "recoverCode" && <RecoverCode setView={setView} />}
        {view === "resetPassword" && <ResetPassword setView={setView} />}
        {view === "secondFactor" && <SecondFactor setView={setView} />}
        {view === "home" && <Home />}
        {view === "profile" && <Profile setView={setView} />} 
        {view === "edit-profile" && <EditProfile setView={setView} />}
        {view === "students" && <Students setView={setView} />}
        {view === "addStudent" && <AddStudent setView={setView} />}
        {view === "guardians" && <Guardians setView={setView} />}
        {view === "addGuardian" && <AddGuardian setView={setView} />}
        {view === "authPeople" && <AuthPeople setView={setView} />}
        {view === "exit" && <Exit setView={setView} />} 
        {view === "exit2" && <Exit2 setView={setView} />}
      </div>
    </div>
  );
}


export default App;
