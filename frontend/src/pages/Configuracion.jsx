import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import "../styles/configuracion.css";

function Configuracion() {

  const navigate = useNavigate();

  const admin =
    JSON.parse(localStorage.getItem("admin"));

  const [temaOscuro, setTemaOscuro] =
    useState(true);

  useEffect(() => {

    const tema =
      localStorage.getItem("tema");

    if(tema === "claro"){

      document.body.classList.add("light");

      setTemaOscuro(false);

    }

  }, []);

  const cambiarTema = () => {

    if(temaOscuro){

      document.body.classList.add("light");

      localStorage.setItem("tema", "claro");

    } else {

      document.body.classList.remove("light");

      localStorage.setItem("tema", "oscuro");

    }

    setTemaOscuro(!temaOscuro);

  };

  return (

    <div className="config-container">

      <div className="config-card">

        <h1>⚙️ Configuración</h1>

        <div className="admin-info">

          <h2>{admin?.nombre}</h2>

          <p>Usuario: {admin?.usuario}</p>

          <p>Rol: {admin?.rol}</p>

        </div>

        <button
          className="config-btn"
          onClick={cambiarTema}
        >
          {
            temaOscuro
            ? "☀️ Tema Claro"
            : "🌙 Tema Oscuro"
          }
        </button>

        <button className="config-btn">
          🔐 Cambiar Contraseña
        </button>

        <button
          className="logout-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Volver al menú
        </button>

      </div>

    </div>

  );

}

export default Configuracion;