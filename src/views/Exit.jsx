import "../styles/text.css";
import "../styles/components.css";
import "../styles/Students.css"
import { useState } from "react";
import "../styles/Exit.css"

function Exit({ setView })  {
  return ( 
    <div  className ="container_2">
        <div className="container-2-1">
            <div className="title"><h2>¿Comenzar proceso de salida?</h2></div>
            <div className="info"><p>Este proceso inicializará la cámara para hacer las
                comparaciones faciales, asegúrese de que <strong> no haya objetos
                obstruyendo la vista de la cámara y que se cuenta con
                iluminación suficiente </strong>para un mejor desempeño.</p></div>
            <div className="btn1">
                <button className="btnConAc" onClick={() => setView("exit2")} >COMENZAR SALIDA</button>
            </div>
        </div>
    </div>
  );
}

export default Exit;