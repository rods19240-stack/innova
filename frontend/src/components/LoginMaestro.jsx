import { useState } from "react";

function LoginMaestro({ setMaestro }) {

  const [usuario,setUsuario] = useState("");
  const [password,setPassword] = useState("");

  const iniciarSesion = async () => {

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

      console.log(data);

      if(data.success){

        localStorage.setItem(
          "maestro",
          JSON.stringify(data.maestro)
        );

        setMaestro(data.maestro);

      } else {

        alert("Credenciales incorrectas");

      }

    } catch(error){

      console.log(error);

    }

  };

  return (

    <div className="login-container">

      <div className="login-card">

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

        <button onClick={iniciarSesion}>
          Entrar
        </button>

      </div>

    </div>

  );

}

export default LoginMaestro;