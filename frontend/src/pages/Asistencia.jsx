import { useState } from "react";

import { useNavigate }
from "react-router-dom";

import QRScanner
from "../components/QRScanner";

import "../styles/asistencia.css";

function Asistencia() {

  const navigate = useNavigate();

  const [alumno, setAlumno] =
    useState(null);

  const registrarAsistencia =
    async (codigo) => {

    try {

      // LIMPIAR QR
      const matricula = codigo
        .replace("ALUMNO_", "")
        .trim();

      console.log(
        "MATRICULA:",
        matricula
      );

      const response = await fetch(
        "http://localhost:3000/asistencia",
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({
            matricula
          })
        }
      );

      const data =
        await response.json();

      console.log(data);

      if(data.success){

        setAlumno(data.alumno);

        // sonido scan
        const audio =
          new Audio("/scan.mp3");

        audio.play();

      } else {

        alert(
          "Alumno no encontrado"
        );

      }

    } catch(error){

      console.log(error);

      alert("Error del servidor");

    }

  };

  return (

    <div className="asistencia-container">

      <h1>
        ASISTENCIA QR
      </h1>

      <button
        className="volver-btn"

        onClick={() =>
          navigate("/dashboard")
        }
      >
        ← Volver al menú
      </button>

      <div className="scanner-box">

        <QRScanner
          onScan={
            registrarAsistencia
          }
        />

      </div>

      {
        alumno && (

          <div className="alumno-card">

            <h2>
              {alumno.nombre}
            </h2>

            <p>
              Matrícula:
              {" "}
              {alumno.matricula}
            </p>

            <p>
              Grupo:
              {" "}
              {alumno.grupo}
            </p>

          </div>

        )
      }

    </div>

  );

}

export default Asistencia;