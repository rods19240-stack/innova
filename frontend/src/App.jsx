import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Asistencia from "./pages/Asistencia";
import Configuracion from "./pages/Configuracion";
import AlumnoDashboard from "./pages/AlumnoDashboard";

import LoginMaestro from "./pages/LoginMaestro";
import DashboardMaestro from "./pages/DashboardMaestro";

function App() {

  // =========================
  // DATOS GUARDADOS
  // =========================

  const alumno =
    JSON.parse(
      localStorage.getItem("alumno")
    );

  const maestro =
    JSON.parse(
      localStorage.getItem("maestro")
    );

  const admin =
    JSON.parse(
      localStorage.getItem("admin")
    );

  return (

    <BrowserRouter>

      <Routes>

        {/* =========================
            LOGIN PRINCIPAL
        ========================= */}

        <Route
          path="/"
          element={<Login />}
        />

        {/* =========================
            DASHBOARD ADMIN
        ========================= */}

        <Route
          path="/dashboard"
          element={
            admin
              ? <Dashboard />
              : <Navigate to="/" />
          }
        />

        {/* =========================
            CONFIGURACION
        ========================= */}

        <Route
          path="/configuracion"
          element={
            admin
              ? <Configuracion />
              : <Navigate to="/" />
          }
        />

        {/* =========================
            ASISTENCIA QR
        ========================= */}

        <Route
          path="/asistencia"
          element={
            admin
              ? <Asistencia />
              : <Navigate to="/" />
          }
        />

        {/* =========================
            PANEL ALUMNO
        ========================= */}

        <Route
          path="/alumno"
          element={
            alumno ? (

              <AlumnoDashboard
                alumno={alumno}
              />

            ) : (

              <Navigate to="/" />

            )
          }
        />

        {/* =========================
            LOGIN MAESTRO
        ========================= */}

        <Route
          path="/login-maestro"
          element={<LoginMaestro />}
        />

        {/* =========================
            DASHBOARD MAESTRO
        ========================= */}

        <Route
          path="/maestro"
          element={
            maestro ? (

              <DashboardMaestro
                maestro={maestro}
              />

            ) : (

              <Navigate
                to="/login-maestro"
              />

            )
          }
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;