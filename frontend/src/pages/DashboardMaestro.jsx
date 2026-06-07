import { useEffect, useState } from "react";
import "../styles/DashboardMaestro.css";

function DashboardMaestro({ maestro }) {

  const [alumnos, setAlumnos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [datos, setDatos] = useState({});
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [archivoExcel, setArchivoExcel] = useState(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");

  useEffect(() => {

    if(grupoSeleccionado){

      cargarAlumnos(grupoSeleccionado);

      cargarMaterias(grupoSeleccionado);

    }

  }, [grupoSeleccionado]);

  const cargarAlumnos = async (grupo) => {

    try {

      const response = await fetch(
        `http://localhost:3000/alumnos-grupo/${grupo}`
      );

      const data = await response.json();

      if(data.success){

        setAlumnos(data.alumnos);

      }

    } catch(error){

      console.log(error);

    }

  };

  const cargarMaterias = async (grupo) => {

    try {

      const response = await fetch(
        `http://localhost:3000/materias-maestro/${maestro.usuario}/${grupo}`
      );

      const data = await response.json();

      if(data.success){

        setMaterias(data.materias);

      }

    } catch(error){

      console.log(error);

    }

  };

  const actualizarDato = (
    matricula,
    campo,
    valor
  ) => {

    setDatos(prev => ({

      ...prev,

      [matricula]: {

        ...prev[matricula],

        [campo]: valor

      }

    }));

  };

  const guardarCalificacion = async (
    matricula
  ) => {

    const alumno = datos[matricula];

    const calificacionFinal = (

      (Number(alumno.desempeno || 0) *
      Number(alumno.pDesempeno || 0) / 100)

     +

      (Number(alumno.producto || 0) *
      Number(alumno.pProducto || 0) / 100)

      +

      (Number(alumno.actitud || 0) *
      Number(alumno.pActitud || 0) / 100)

      +

      (Number(alumno.conocimiento || 0) *
      Number(alumno.pConocimiento || 0) / 100)

    ).toFixed(1);

    const sumaPorcentajes =

      Number(alumno.pDesempeno || 0) +
      Number(alumno.pProducto || 0) +
      Number(alumno.pActitud || 0) +
      Number(alumno.pConocimiento || 0);

    if(sumaPorcentajes !== 100){

      alert(
        "Los porcentajes deben sumar 100%"
      );

      return;

    }

    console.log(alumno);

    try {

      const response = await fetch(

        "http://localhost:3000/guardar-calificacion",

        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({

            matricula,

            materia: alumno.materia,

            parcial: alumno.parcial,

            calificacion: calificacionFinal,

            desempeno: alumno.desempeno,

            producto: alumno.producto,

            actitud: alumno.actitud,

            conocimiento: alumno.conocimiento,

            pDesempeno: alumno.pDesempeno,

            pProducto: alumno.pProducto,

            pActitud: alumno.pActitud,

            pConocimiento: alumno.pConocimiento,

            asistencias: alumno.asistencias,

            faltas: alumno.faltas

          })

        }

      );

      const data = await response.json();

      alert(data.message);

    } catch(error){

      console.log(error);

    }

  };

  const importarExcel = async () => {

    if(!archivoExcel){

      alert("Selecciona un archivo Excel");

      return;

    }

    const formData = new FormData();

    formData.append(
      "archivo",
      archivoExcel
    );

    try {

      const response = await fetch(

        "http://localhost:3000/importar-calificaciones",

        {
          method:"POST",
          body:formData
        }

      );

      const data =
        await response.json();

      alert(data.message);

    } catch(error){

      console.log(error);

    }

  };

  const descargarPlantilla = async () => {

    if(!grupoSeleccionado || !materiaSeleccionada){

      alert("Selecciona grupo y materia");
      return;

    }

    window.open(
      `http://localhost:3000/exportar-plantilla/${grupoSeleccionado}/${materiaSeleccionada}`,
      "_blank"
    );

  };

  const cerrarSesion = () => {

    localStorage.removeItem(
      "maestro"
    );

    window.location.reload();

  };

  return (

    <div className="maestro-container">

      <div className="maestro-card">

        <button
          className="cerrar-btn"
          onClick={cerrarSesion}
        >
          ← Cerrar Sesión
        </button>

        <select
          value={materiaSeleccionada}
          onChange={(e) =>
            setMateriaSeleccionada(e.target.value)
          }
        >
          <option value="">
            Seleccionar Materia
          </option>

          {materias.map((materia, index) => (
            <option
              key={index}
              value={materia.materia}
            >
              {materia.materia}
            </option>
          ))}
        </select>

        <button onClick={descargarPlantilla}>
          Descargar Plantilla Excel
        </button>

        <button 
          className="mapa-btn"
          onClick={() => window.open("/mapa_escuela.html", "_blank")}
        >
          Mapa🗺️
        </button>

        <h1>
          Bienvenido Maestro
        </h1>

        <div className="info-grid">

          <div className="info-box">

            <h3>Nombre</h3>

            <p>{maestro.nombre}</p>

          </div>

          <div className="info-box">

            <h3>Usuario</h3>

            <p>{maestro.usuario}</p>

          </div>

        </div>

        <h2>
          Calificaciones
        </h2>

        <select
          value={grupoSeleccionado}
          onChange={(e)=>
            setGrupoSeleccionado(
              e.target.value
            )
          }
        >
          <option value="">
            Seleccionar Grupo
          </option>

          <option value="4E">
            4E
          </option>

          <option value="4F">
            4F
          </option>

          <option value="2F">
            2F
          </option>

        </select>

        <div
          style={{
            display:"flex",
            gap:"10px",
            marginTop:"20px"
          }}
        >

          <input

            type="file"

            accept=".xlsx,.xls"

            onChange={(e)=>

              setArchivoExcel(
                e.target.files[0]
              )

            }

          />

          <button
            onClick={importarExcel}
          >
            Importar Excel
          </button>

        </div>

        {

          grupoSeleccionado && 

          alumnos.map(alumno => (

            <div
              key={alumno.matricula}
              className="alumno-item"
            >

              <h3>
                {alumno.nombre}
              </h3>

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

              <select

                onChange={(e)=>

                  actualizarDato(

                    alumno.matricula,

                    "materia",

                    e.target.value

                  )

                }

              >

                <option value="">
                  Seleccionar Materia
                </option>

                {

                  materias.map(
                    (materia,index) => (

                      <option
                        key={index}
                        value={materia.materia}
                      >

                        {materia.materia}

                      </option>

                    )
                  )

                }

              </select>

              <select

                onChange={(e)=>

                  actualizarDato(

                    alumno.matricula,

                    "parcial",

                    e.target.value

                  )

                }

              >

                <option value="">
                  Parcial
                </option>

                <option value="1">
                  1
                </option>

                <option value="2">
                  2
                </option>

                <option value="3">
                  3
                </option>

              </select>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="Desempeño"
                onChange={(e)=>
                  actualizarDato(
                    alumno.matricula,
                    "desempeno",
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                min="0"
                max="100"
                placeholder="% Desempeño"
                onChange={(e)=>
                  actualizarDato(
                    alumno.matricula,
                    "pDesempeno",
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="Producto"
                onChange={(e)=>
                actualizarDato(
                  alumno.matricula,
                  "producto",
                  e.target.value
                )
              }
            />

            <input
              type="number"
              min="0"
              max="100"
              placeholder="% Producto"
              onChange={(e)=>
                actualizarDato(
                  alumno.matricula,
                  "pProducto",
                  e.target.value
                )
              }
            />

            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Actitud"
              onChange={(e)=>
                actualizarDato(
                  alumno.matricula,
                  "actitud",
                  e.target.value
                )
              }
            />

            <input
              type="number"
              min="0"
              max="100"
              placeholder="% Actitud"
              onChange={(e)=>
                actualizarDato(
                  alumno.matricula,
                  "pActitud",
                  e.target.value
                )
              }
            />

            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Conocimiento"
              onChange={(e)=>
                actualizarDato(
                  alumno.matricula,
                  "conocimiento",
                  e.target.value
                )
              }
            />

            <input
              type="number"
              min="0"
              max="100"
              placeholder="% Conocimiento"
              onChange={(e)=>
                actualizarDato(
                  alumno.matricula,
                  "pConocimiento",
                  e.target.value
                )
              }
            />

            <input
              type="number"
              min="0"
              placeholder="Asistencias"
              onChange={(e)=>
                actualizarDato(
                  alumno.matricula,
                  "asistencias",
                  e.target.value
                )
              }
            />

            <input
              type="number"
              min="0"
              placeholder="Faltas"
              onChange={(e)=>
                actualizarDato(
                  alumno.matricula,
                  "faltas",
                  e.target.value
                )
              }
            />


              <button

                onClick={()=>

                  guardarCalificacion(
                    alumno.matricula
                  )

                }

              >

                Guardar

              </button>

            </div>

          ))

        }

      </div>

    </div>

  );

}

export default DashboardMaestro;