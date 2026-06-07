import { useState } from "react";

import QRScanner from "../components/QRScanner";
import Dashboard from "./Dashboard";
import AlumnoDashboard from "./AlumnoDashboard";
import DashboardMaestro from "./DashboardMaestro";

import "../styles/login.css";

function Login() {

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const [admin, setAdmin] = useState(null);
  const [alumno, setAlumno] = useState(null);
  const [maestro, setMaestro] = useState(null);

  const [mostrarQR, setMostrarQR] = useState(false);

  // =========================
  // LOGIN NORMAL
  // =========================
  const iniciarSesion = async () => {

    try {

      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          usuario: usuario.trim(),
          password: password.trim()
        })
      });

      const data = await response.json();

      if (data.success) {

        if (data.tipo === "admin") {
          setAdmin(data.usuario);
          localStorage.setItem("admin", JSON.stringify(data.usuario));
        }

        else if (data.tipo === "alumno") {
          setAlumno(data.usuario);
          localStorage.setItem("alumno", JSON.stringify(data.usuario));
        }

        else if (data.tipo === "maestro") {
          setMaestro(data.usuario);
          localStorage.setItem("maestro", JSON.stringify(data.usuario));
        }

      } else {
        alert(data.message);
      }

    } catch (error) {
      console.log(error);
      alert("Error del servidor");
    }
  };

  // =========================
  // QR (CORREGIDO DEFINITIVO)
  // =========================
  const manejarQR = async (codigo) => {

    try {

      console.log("QR original:", codigo);

      // SOLO limpieza básica (NO romper matrícula)
      const codigoFinal = codigo.trim();

      console.log("QR enviado a backend:", codigoFinal);

      const response = await fetch("http://localhost:3000/login-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          codigo: codigoFinal
        })
      });

      const data = await response.json();

      console.log("Respuesta backend:", data);

      if (data.success) {

        setAlumno(data.usuario);

        localStorage.setItem(
          "alumno",
          JSON.stringify(data.usuario)
        );

      } else {
        alert(data.message || "Alumno no encontrado");
      }

    } catch (error) {
      console.log(error);
      alert("Error al escanear QR");
    }
  };

  // =========================
  // CERRAR SESION
  // =========================
  const cerrarSesion = () => {

    setAdmin(null);
    setAlumno(null);
    setMaestro(null);
    setMostrarQR(false);

    localStorage.removeItem("admin");
    localStorage.removeItem("alumno");
    localStorage.removeItem("maestro");
  };

  // =========================
  // PANELES
  // =========================
  if (admin) return <Dashboard admin={admin} cerrarSesion={cerrarSesion} />;
  if (alumno) return <AlumnoDashboard alumno={alumno} />;
  if (maestro) return <DashboardMaestro maestro={maestro} />;

  // =========================
  // UI
  // =========================
  return (
    <div className="login-container">

      <img src="/header.png" alt="Header" className="header-img" />

      <div className="fondo-container">

        <video autoPlay loop muted playsInline className="fondo-video">
          <source src="/fondo_lobo_animado.mp4" type="video/mp4" />
        </video>

        <div className="login-box">

          <h2>INICIAR SESIÓN</h2>

          <input
            type="text"
            value={usuario}
            placeholder="Usuario o Matrícula"
            onChange={(e) => setUsuario(e.target.value)}
          />

          <input
            type="password"
            value={password}
            placeholder="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-btn" onClick={iniciarSesion}>
            Entrar
          </button>

          <div className="separador">
            <span>O</span>
          </div>

          <button
            className="qr-btn"
            onClick={() => setMostrarQR(!mostrarQR)}
          >
            Iniciar con QR
          </button>

          <div className="fake-camera">
            <div className="scanner-line"></div>

            {mostrarQR ? (
              <QRScanner onScan={manejarQR} />
            ) : (
              <p>ESCANEAR QR</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;