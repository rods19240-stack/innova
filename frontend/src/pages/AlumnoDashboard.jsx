import React, { useEffect, useState } from "react";
import "../styles/alumno.css";

function AlumnoDashboard({ alumno }) {

  const [materias, setMaterias] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  const cerrarSesion = () => {

    localStorage.removeItem("alumno");
    window.location.reload();

  };

  useEffect(() => {

    obtenerMaterias();
    obtenerCalificaciones();

  }, []);

const obtenerMaterias = async () => {

  try {

    console.log("GRUPO DEL ALUMNO:", alumno.grupo);

    const response = await fetch(
      `http://localhost:3000/materias/${alumno.grupo}`
    );

    const data = await response.json();

    console.log("MATERIAS:", data);

    if(data.success){

      setMaterias(data.materias);

    }

  } catch(error){

    console.log(error);

  }

};

  const obtenerCalificaciones = async () => {

    try {

      const response = await fetch(
        `http://localhost:3000/calificaciones/${alumno.matricula}`
      );

      const data = await response.json();

      if(data.success){

        setCalificaciones(data.calificaciones);

      }

    } catch(error){

      console.log(error);

    }

  };

  const obtenerParcial = (materia, parcial) => {

    const calificacion = calificaciones.find(

      c =>
        c.materia === materia &&
        Number(c.parcial) === parcial

    );

    return calificacion
      ? calificacion.calificacion
      : "-";

  };

  const obtenerDetalleParcial = (
    materia,
    parcial
  ) =>{
    return calificaciones.find(
      c =>
        c.materia === materia && Number(c.parcial) === parcial
    );
  };

  const calcularPromedio = (materia) => {

    const notas = calificaciones.filter(
      c => c.materia === materia
    );

    if(notas.length < 3){

      return "-";

    }

    const suma = notas.reduce(
      (acc,item) =>
        acc + Number(item.calificacion),
      0
    );

    return (suma / 3).toFixed(1);

  };

  return (

    <div className="alumno-container">

      <div className="alumno-card">

        <button
          className="volver-btn"
          onClick={cerrarSesion}
        >
          ← Cerrar sesión
        </button>

        <button 
          className="mapa-btn"
          onClick={() => window.open("/mapa_escuela.html", "_blank")}
        >
          Mapa🗺️
        </button>

        <h1>{alumno.nombre}</h1>

        <div className="info-grid">

          <div className="info-box">

            <h3>Matrícula</h3>
            <p>{alumno.matricula}</p>

          </div>

          <div className="info-box">

            <h3>Grupo</h3>
            <p>{alumno.grupo}</p>

          </div>

          <div className="info-box">

            <h3>Turno</h3>
            <p>{alumno.turno}</p>

          </div>

          <div className="info-box">

            <h3>Carrera</h3>
            <p>{alumno.carrera}</p>

          </div>

        </div>

        <div className="materias-container">

          <h2>Materias</h2>

          {

            materias.length > 0 ? (

              <table className="materias-table">

                <thead>

                  <tr>

                    <th>Materia</th>
                    <th>Grupo</th>
                    <th>1° Parcial</th>
                    <th>2° Parcial</th>
                    <th>3° Parcial</th>
                    <th>Promedio</th>

                  </tr>

                </thead>

                <tbody>

                  {

                    materias.map((materia,index) => {

                      const nombreMateria =
                        materia.nombre ||
                        materia.materia;

                      const p1 =
                        obtenerParcial(
                          nombreMateria,
                          1
                        );

                      const p2 =
                        obtenerParcial(
                          nombreMateria,
                          2
                        );

                      const p3 =
                        obtenerParcial(
                          nombreMateria,
                          3
                        );

                        const obtenerDetalleParcial = (
                          materia,
                          parcial
                        ) => {
                          console.log("DETALLE BUSCADO:",
                            materia,
                            parcial,
                            calificaciones
                          );

                          return calificaciones.find(
                            c =>
                              c.materia === materia &&
                              Number(c.parcial) === parcial
                          );
                        };
                      return (

                        <React.Fragment
                          key={index}
                        >

                          <tr>

                            <td>
                              {nombreMateria}
                            </td>

                            <td>
                              {alumno.grupo}
                            </td>

                            <td
                              className="parcial-btn"
                              onClick={() =>
                                setDetalleSeleccionado(
                                  detalleSeleccionado?.materia === nombreMateria &&
                                  detalleSeleccionado?.parcial === 1
                                    ? null
                                    :{
                                      materia:nombreMateria,
                                      parcial:1
                                    }
                                )
                              }
                            >
                              {p1}
                            </td>

                            <td
                              className="parcial-btn"
                              onClick={() =>
                                setDetalleSeleccionado(
                                  detalleSeleccionado?.materia === nombreMateria &&
                                  detalleSeleccionado?.parcial === 2
                                    ? null
                                    :{
                                  materia:nombreMateria,
                                  parcial:2
                                })
                              }
                            >
                              {p2}
                            </td>

                            <td
                              className="parcial-btn"
                              onClick={() =>
                                setDetalleSeleccionado(
                                  detalleSeleccionado?.materia === nombreMateria &&
                                  detalleSeleccionado?.parcial === 3
                                    ? null
                                    :{
                                  materia:nombreMateria,
                                  parcial:3
                                })
                              }
                            >
                              {p3}
                            </td>

                            <td>

                              {
                                calcularPromedio(
                                  nombreMateria
                                )
                              }

                            </td>

                          </tr>

                          {

                            detalleSeleccionado &&
                            detalleSeleccionado.materia === nombreMateria &&

                            detalleSeleccionado.parcial !== undefined && (

                              <tr>

                                <td
                                  colSpan="6"
                                  className="detalle-box"
                                >

                                  <h3>

                                    Materia:
                                    {" "}
                                    {nombreMateria}

                                  </h3>

                                  <h4>

                                    Parcial:
                                    {" "}
                                    {
                                      detalleSeleccionado.parcial?.low || detalleSeleccionado.parcial
                                    }

                                  </h4>

                                  {
                                    (() => {
                                      const detalle = obtenerDetalleParcial(
                                        nombreMateria,
                                        detalleSeleccionado.parcial
                                      );

                                      console.log("DETALLE COMPLETO:", detalle);

                                      if(!detalle){

                                        return (
                                          <p>
                                            No existe información
                                          </p>
                                        );
                                      }

                                      console.log(detalle);

                                      return (
                                        <div className="detalle-rubrica">
                                            <div className="rubrica-card">
                                              <h4>Desempeño</h4>
                                              <p>
                                                {detalle.desempeno?.low ?? detalle.desempeno}/10
                                              </p>
                                              <span>valor: {detalle.pDesempeno}%</span>
                                              <p></p>
                                              <small>= {(detalle.desempeno * detalle.pDesempeno / 100).toFixed(1)}</small>
                                            </div>
                                            <div className="rubrica-card">
                                              <h4>Producto</h4>
                                              <p>
                                                {detalle.producto?.low || detalle.producto}/10
                                              </p>
                                              <span>valor: {detalle.pProducto}%</span>
                                              <p></p>
                                              <small>= {(detalle.producto * detalle.pProducto / 100).toFixed(1)}</small>
                                            </div>
                                            <div className="rubrica-card">
                                              <h4>Actitud</h4>
                                              <p>
                                                {detalle.actitud?.low || detalle.actitud}/10
                                              </p>
                                              <span>valor: {detalle.pActitud}%</span>
                                              <p></p>
                                              <small>= {(detalle.actitud * detalle.pActitud / 100).toFixed(1)}</small>
                                            </div>
                                            <div className="rubrica-card">
                                              <h4>Conocimiento</h4>
                                              <p>
                                                {detalle.conocimiento?.low ?? detalle.conocimiento}/10
                                              </p>
                                              <span>valor: {detalle.pConocimiento}%</span>
                                              <p></p>
                                              <small>= {(detalle.conocimiento * detalle.pConocimiento / 100).toFixed(1)}</small>
                                            </div>
                                            <div className="rubrica-card">
                                              <h4>Asistencias</h4>
                                              <p>
                                                {detalle.asistencias?.low ?? detalle.asistencias}
                                              </p>
                                            </div>
                                            <div className="rubrica-card">
                                              <h4>Faltas</h4>
                                              <p>
                                                {detalle.faltas?.low ?? detalle.faltas}
                                              </p>
                                            </div>
                                            <div className="rubrica-card">
                                              <h4>Calificación Final</h4>
                                              <p>
                                                {detalle.calificacion?.low ?? detalle.calificacion}
                                              </p>
                                            </div>
                                        </div>
                                      );
                                    })()
                                  }

                                </td>

                              </tr>

                            )

                          }

                        </React.Fragment>

                      );

                    })

                  }

                </tbody>

              </table>

            ) : (

              <p>

                No hay materias asignadas

              </p>

            )

          }

        </div>

      </div>

    </div>

  );

}

export default AlumnoDashboard;