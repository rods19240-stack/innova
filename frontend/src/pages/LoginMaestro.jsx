import { useState } from "react";

import "../styles/loginMaestro.css";

function LoginMaestro({ setMaestro }) {

  const [usuario,setUsuario] = useState("");

  const [password,setPassword] = useState("");

  const [error,setError] = useState("");

  // =========================
  // LOGIN
  // =========================

  const iniciarSesion = async (e) => {

    e.preventDefault();

    try{

      const response = await fetch(
        "http://localhost:3000/login-maestro",
        {
          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({
            usuario,
            password
          })
        }
      );

      const data = await response.json();

      if(data.success){

        localStorage.setItem(
          "maestro",
          JSON.stringify(data.maestro)
        );

        setMaestro(data.maestro);

      } else {

        setError(
          "Usuario o contraseña incorrectos"
        );

      }

    } catch(error){

      console.log(error);

      setError("Error del servidor");

    }

  };

  return (

    <div className="login-maestro-container">

      <form
        className="login-maestro-card"
        onSubmit={iniciarSesion}
      >

        <h1>Login Maestro</h1>

        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e)=>
            setUsuario(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e)=>
            setPassword(e.target.value)
          }
        />

        <button type="submit">

          Ingresar

        </button>

        {
          error && (

            <p className="error-text">

              {error}

            </p>

          )
        }

      </form>

    </div>

  );

}

export default LoginMaestro;