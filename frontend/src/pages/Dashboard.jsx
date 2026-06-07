import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/dashboard.css";

function Dashboard({ admin, cerrarSesion }) {
  const navigate = useNavigate();

  const [hora, setHora] = useState("");

  useEffect(() => {

    const interval = setInterval(() => {

      const fecha = new Date();

      setHora(
        fecha.toLocaleTimeString()
      );

    }, 1000);

    return () => clearInterval(interval);

  }, []);

  return (

    <div className="dashboard-container">

      <aside className="sidebar">

        <h2>INNOVA</h2>

        <button>🏠 Inicio</button>

        <button>👥 Usuarios</button>

        <button onClick={() => navigate("/asistencia")}>
          📷 Asistencia
        </button>

        <button>
          📊 Reportes
        </button>

        <button
          className="logout-btn"
          onClick={cerrarSesion}
        >
          🚪 Cerrar sesión
        </button>

      </aside>

      <main className="main-content">

        <div className="topbar">

          <div>

            <h1>
              Bienvenido {admin?.nombre}
            </h1>

            <p>
              Rol: {admin?.rol}
            </p>

          </div>

          <div className="top-right">

            <div className="clock">
              ⏰ {hora}
            </div>

            <div className="profile">
              👤
            </div>

          </div>

        </div>

        <img
          src="/header.png"
          alt="Header"
          className="dashboard-header"
        />

        <div className="cards-container">

          <div className="card">
            <h3>Usuarios</h3>
            <p>120</p>
          </div>

          <div className="card">
            <h3>Asistencias</h3>
            <p>89%</p>
          </div>

          <div className="card">
            <h3>Reportes</h3>
            <p>15</p>
          </div>

        </div>

      </main>

    </div>

  );

}

export default Dashboard;