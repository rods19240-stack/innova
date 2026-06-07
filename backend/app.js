const express = require("express");
const cors = require("cors");
const driver = require("./config/neo4j");
const ExcelJS = require("exceljs");
const multer = require("multer");
const XLSX = require("xlsx");

require("dotenv").config();

const app = express();
const upload = multer({
  dest: "uploads/"
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 INNOVA API</h1>
    <p>Servidor funcionando correctamente</p>
  `);
});

app.post(
  "/importar-calificaciones",
  upload.single("archivo"),
  async (req, res) => {

    let session;

    try {

      const workbook =
        XLSX.readFile(req.file.path);

      console.log(
        "Hojas encontradas:",
        workbook.SheetNames
      );

      const hoja =
        workbook.Sheets["Calificaciones"];

      if (!hoja) {

        return res.status(400).json({
          success: false,
          message: "No existe la hoja 'Calificaciones'"
        });

      }

      const datos = XLSX.utils
        .sheet_to_json(hoja)
        .filter(fila => 
          fila.matricula
          && fila.materia
          && fila.parcial
        );

        console.log(
          "Total filas:",
          datos.length
        );

      console.log(
        "Primer registro:",
        datos[0]
      );

      session =
        driver.session();

      for (const fila of datos) {

        console.log("Fila:", fila);

        await session.run(

          `
          MATCH (a:Alumno {
            matricula:$matricula
          })

          MERGE (a)-[:TIENE_CALIFICACION]->
          (c:Calificacion {
            materia:$materia,
            parcial:$parcial
          })

          SET
          c.calificacion = toFloat($calificacion),

          c.desempeno = toFloat($desempeno),
          c.producto = toFloat($producto),
          c.actitud = toFloat($actitud),
          c.conocimiento = toFloat($conocimiento),

          c.pDesempeno = toFloat($pDesempeno),
          c.pProducto = toFloat($pProducto),
          c.pActitud = toFloat($pActitud),
          c.pConocimiento = toFloat($pConocimiento),

          c.asistencias = toInteger($asistencias),
          c.faltas = toInteger($faltas)
          `,

          {
            matricula: fila.matricula,

            materia: fila.materia,
            parcial: fila.parcial,

            calificacion: fila.calificacion || 0,

            desempeno: fila.desempeno || 0,
            producto: fila.producto || 0,
            actitud: fila.actitud || 0,
            conocimiento: fila.conocimiento || 0,

            pDesempeno: fila.pDesempeno || 0,
            pProducto: fila.pProducto || 0,
            pActitud: fila.pActitud || 0,
            pConocimiento: fila.pConocimiento || 0,

            asistencias: fila.asistencias || 0,
            faltas: fila.faltas || 0
          }

        );

      }

      res.json({
        success: true,
        message: "Calificaciones importadas correctamente"
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message: "Error importando Excel"
      });

    } finally {

      if (session) {
        await session.close();
      }

    }

  }
);

app.get("/prueba", (req, res) => {

  res.json({
    success: true,
    mensaje: "Servidor funcionando"
  });

});

/* =========================
   LOGIN AUTOMATICO
========================= */

app.post("/login", async (req, res) => {

  const { usuario, password } = req.body;

  if(!usuario || !password){

    return res.json({
      success:false,
      message:"Completa todos los campos"
    });

  }

  const session = driver.session();

  try {

    // =========================
    // ADMIN
    // =========================

    let result = await session.run(

      `
      MATCH (a:Admin)
      WHERE a.usuario = $usuario
      AND a.password = $password
      RETURN a
      `,

      {
        usuario,
        password
      }

    );

    if(result.records.length > 0){

      const admin =
        result.records[0]
        .get("a")
        .properties;

      return res.json({
        success:true,
        tipo:"admin",
        usuario:admin
      });

    }

    // =========================
    // MAESTRO
    // =========================

    result = await session.run(

      `
      MATCH (m:Maestro)
      WHERE m.usuario = $usuario
      AND m.password = $password
      RETURN m
      `,

      {
        usuario,
        password
      }

    );

    if(result.records.length > 0){

      const maestro =
        result.records[0]
        .get("m")
        .properties;

      return res.json({
        success:true,
        tipo:"maestro",
        usuario:maestro
      });

    }

    // =========================
    // ALUMNO
    // =========================

    result = await session.run(

      `
      MATCH (a:Alumno)
      WHERE a.matricula = $usuario
      AND a.password = $password
      RETURN a
      `,

      {
        usuario,
        password
      }

    );

    if(result.records.length > 0){

      const alumno =
        result.records[0]
        .get("a")
        .properties;

      return res.json({
        success:true,
        tipo:"alumno",
        usuario:alumno
      });

    }

    // =========================
    // NO ENCONTRADO
    // =========================

    return res.json({
      success:false,
      message:"Usuario o contraseña incorrectos"
    });

  } catch(error){

    console.log(error);

    return res.status(500).json({
      success:false,
      message:"Error del servidor"
    });

  } finally {

    await session.close();

  }

});

/* =========================
   OBTENER MATERIAS
========================= */

app.get("/materias/:grupo", async (req, res) => {

  const { grupo } = req.params;

  console.log("GRUPO RECIBIDO:", grupo);

  const session = driver.session();

  try {

    const result = await session.run(

      `
      MATCH (m:Materia)-[:EN_GRUPO]->(g:Grupo)
      WHERE g.nombre = $grupo
      RETURN m.nombre AS materia
      `,

      { grupo }

    );

    console.log(
      "MATERIAS ENCONTRADAS:",
      result.records.map(r => r.get("materia"))
    );

    const materias = result.records.map(record => ({
      materia: record.get("materia")
    }));

    res.json({
      success: true,
      materias
    });

  } catch(error){

    console.log(error);

    res.status(500).json({
      success:false,
      message:"Error obteniendo materias"
    });

  } finally {

    await session.close();

  }

});

/* =========================
   MATERIAS DEL MAESTRO
========================= */

app.get("/alumnos-grupo/:grupo", async (req, res) => {

  const { grupo } = req.params;

  const session = driver.session();

  try {

    const result = await session.run(

      `
      MATCH (a:Alumno)-[:PERTENECE_A]->(g:Grupo)
      WHERE g.nombre = $grupo

      RETURN a
      ORDER BY a.nombre
      `,

      { grupo }

    );

    const alumnos = result.records.map(
      record => record.get("a").properties
    );

    res.json({
      success:true,
      alumnos
    });

  } catch(error){

    console.log(error);

    res.status(500).json({
      success:false
    });

  } finally {

    await session.close();

  }

});

/* =========================
   ALUMNOS POR GRUPO
========================= */

app.get("/materias-maestro/:usuario/:grupo", async (req, res) => {

  const { usuario, grupo } = req.params;

  const session = driver.session();

  try {

    const result = await session.run(

      `
      MATCH (m:Maestro {usuario:$usuario})
      -[:IMPARTE]->
      (mat:Materia)
      -[:EN_GRUPO]->
      (g:Grupo {nombre:$grupo})

      RETURN DISTINCT mat.nombre AS materia
      `,

      { usuario, grupo }

    );

    const materias = result.records.map(record => ({
      materia: record.get("materia")
    }));

    res.json({
      success: true,
      materias
    });

  } catch(error){

    console.log(error);

    res.status(500).json({
      success:false
    });

  } finally {

    await session.close();

  }

});
 
/* =========================
   ASISTENCIA QR
========================= */

app.post("/asistencia", async (req, res) => {

  const { matricula } = req.body;

  const session = driver.session();

  try {

    const fecha = new Date();

    const result = await session.run(

      `
      MATCH (a:Alumno)
      WHERE a.matricula = $matricula

      CREATE (as:Asistencia {
        fecha:$fecha
      })

      CREATE (a)-[:REGISTRO]->(as)

      RETURN a
      `,

      {
        matricula,
        fecha:fecha.toLocaleString()
      }

    );

    if(result.records.length > 0){

      const alumno =
        result.records[0]
        .get("a")
        .properties;

      return res.json({
        success:true,
        alumno
      });

    }

    res.json({
      success:false,
      message:"Alumno no encontrado"
    });

  } catch(error){

    console.log(error);

    res.status(500).json({
      success:false,
      message:"Error registrando asistencia"
    });

  } finally {

    await session.close();

  }

});

app.post("/guardar-calificacion", async (req, res) => {

  const {
    matricula,
    materia,
    parcial,
    calificacion,
    desempeno,
    producto,
    actitud,
    conocimiento,
    pDesempeno,
    pProducto,
    pActitud,
    pConocimiento,
    asistencias,
    faltas
  } = req.body;

  const session = driver.session();

  try {

    await session.run(

      `
      MATCH (a:Alumno {matricula:$matricula})

      MERGE (a)-[:TIENE_CALIFICACION]->
      (c:Calificacion {
        materia:$materia,
        parcial:$parcial
      })

      SET
      c.calificacion = toFloat($calificacion),

      c.desempeno = toFloat($desempeno),
      c.producto = toFloat($producto),
      c.actitud = toFloat($actitud),
      c.conocimiento = toFloat($conocimiento),

      c.pDesempeno = toFloat($pDesempeno),
      c.pProducto = toFloat($pProducto),
      c.pActitud = toFloat($pActitud),
      c.pConocimiento = toFloat($pConocimiento),

      c.asistencias = toInteger($asistencias),
      c.faltas = toInteger($faltas)

      RETURN c
      `,

      {
        matricula,
        materia,
        parcial,
        calificacion,
        desempeno,
        producto,
        actitud,
        conocimiento,
        pDesempeno,
        pProducto,
        pActitud,
        pConocimiento,
        asistencias,
        faltas
      }

    );

    res.json({
      success:true,
      message:"Calificación guardada correctamente"
    });

  } catch(error){

    console.log(error);

    res.status(500).json({
      success:false,
      message:"Error guardando calificación"
    });

  } finally {

    await session.close();

  }

});

/* =========================
   OBTENER CALIFICACIONES
========================= */

app.get(
  "/calificaciones/:matricula",
  async (req, res) => {

    const { matricula } = req.params;

    const session = driver.session();

    try {

      const result = await session.run(

        `
        MATCH (a:Alumno {
          matricula:$matricula
        })

        -[:TIENE_CALIFICACION]->
        (c:Calificacion)

        RETURN
        c.materia AS materia,
        c.parcial AS parcial,
        c.calificacion AS calificacion,
        c.desempeno AS desempeno,
        c.producto AS producto,
        c.actitud AS actitud,
        c.conocimiento AS conocimiento,
        c.pDesempeno AS pDesempeno,
        c.pProducto AS pProducto,
        c.pActitud AS pActitud,
        c.pConocimiento AS pConocimiento,
        c.asistencias AS asistencias,
        c.faltas AS faltas
        `,

        { matricula }

      );

      const calificaciones =
        result.records.map(record => ({

          materia:
            record.get("materia"),

          parcial:
            record.get("parcial"),

          calificacion:
            record.get("calificacion"),
          desempeno:
            record.get("desempeno"),
          producto:
            record.get("producto"),
          actitud:
            record.get("actitud"),
          conocimiento:
            record.get("conocimiento"),
          pDesempeno:
            record.get("pDesempeno"),
          pProducto:
            record.get("pProducto"),
          pActitud:
            record.get("pActitud"),
          pConocimiento:
            record.get("pConocimiento"),
          asistencias:
            record.get("asistencias"),
          faltas:
            record.get("faltas"),
        }));

      res.json({
        success:true,
        calificaciones
      });

    } catch(error){

      console.log(error);

      res.status(500).json({
        success:false,
        message:"Error obteniendo calificaciones"
      });

    } finally {

      await session.close();

    }

  }

);

/* =========================
   EXPORTAR ALUMNOS EXCEL
========================= */

app.get("/exportar-alumnos", async (req, res) => {

  const session = driver.session();

  try {

    const result = await session.run(`

      MATCH (a:Alumno)

      RETURN
      a.matricula AS matricula,
      a.nombre AS nombre,
      a.grupo AS grupo,
      a.carrera AS carrera,
      a.turno AS turno

      ORDER BY a.nombre

    `);

    const workbook = new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet("Alumnos");

    worksheet.columns = [

      {
        header: "Matricula",
        key: "matricula",
        width: 20
      },

      {
        header: "Nombre",
        key: "nombre",
        width: 35
      },

      {
        header: "Grupo",
        key: "grupo",
        width: 15
      },

      {
        header: "Carrera",
        key: "carrera",
        width: 30
      },

      {
        header: "Turno",
        key: "turno",
        width: 15
      }

    ];

    result.records.forEach(record => {

      worksheet.addRow({

        matricula:
          record.get("matricula"),

        nombre:
          record.get("nombre"),

        grupo:
          record.get("grupo"),

        carrera:
          record.get("carrera"),

        turno:
          record.get("turno")

      });

    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=alumnos.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch(error){

    console.log(error);

    res.status(500).json({
      success:false
    });

  } finally {

    await session.close();

  }

});

app.get(
  "/exportar-plantilla/:grupo/:materia",
  async (req, res) => {

    const { grupo, materia } = req.params;

    const session = driver.session();

    try {

      const result = await session.run(
        `
        MATCH (a:Alumno)
        WHERE a.grupo = $grupo

        RETURN
        a.matricula AS matricula,
        a.nombre AS nombre

        ORDER BY a.nombre
        `,
        { grupo }
      );

      // CARGAR LA PLANTILLA ORIGINAL
      const workbook = new ExcelJS.Workbook();

      await workbook.xlsx.readFile(
        "./plantillas/plantilla.xlsx"
      );

      // OBTENER LAS HOJAS QUE YA EXISTEN
      const hojaAsistencia =
        workbook.getWorksheet("Asistencias");

      const hojaCalificaciones =
        workbook.getWorksheet("Calificaciones");

      const hojaTrabajos =
        workbook.getWorksheet("Trabajos");

      // COMENZAR A ESCRIBIR DESDE LA FILA 2
      let filaAsistencia = 2;
      let filaCalificaciones = 2;
      let filaTrabajos = 2;

      result.records.forEach(record => {

        const matricula =
          record.get("matricula");

        const nombre =
          record.get("nombre");

        // =====================
        // ASISTENCIAS
        // =====================

        hojaAsistencia.getCell(`A${filaAsistencia}`).value =
          matricula;

        hojaAsistencia.getCell(`B${filaAsistencia}`).value =
          nombre;

        filaAsistencia++;

        // =====================
        // CALIFICACIONES
        // =====================

        hojaCalificaciones.getCell(`A${filaCalificaciones}`).value =
          matricula;

        hojaCalificaciones.getCell(`B${filaCalificaciones}`).value =
          nombre;

        hojaCalificaciones.getCell(`C${filaCalificaciones}`).value =
          materia;

        filaCalificaciones++;

        // =====================
        // TRABAJOS
        // =====================

        hojaTrabajos.getCell(`A${filaTrabajos}`).value =
          matricula;

        hojaTrabajos.getCell(`B${filaTrabajos}`).value =
          nombre;

        filaTrabajos++;

      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${grupo}-${materia}.xlsx`
      );

      await workbook.xlsx.write(res);

      res.end();

    } catch(error){

      console.log(error);

      res.status(500).json({
        success:false,
        message:"Error generando plantilla"
      });

    } finally {

      await session.close();

    }

  }
);

/* =========================
   OBTENER ALUMNOS
========================= */

app.get("/alumnos", async (req, res) => {

  const session = driver.session();

  try {

    const result = await session.run(

      `
      MATCH (a:Alumno)
      RETURN a
      ORDER BY a.nombre
      `

    );

    const alumnos = result.records.map(
      record => record.get("a").properties
    );

    res.json({
      success:true,
      alumnos
    });

  } catch(error){

    console.log(error);

    res.status(500).json({
      success:false,
      message:"Error obteniendo alumnos"
    });

  } finally {

    await session.close();

  }

});

app.post("/login-qr", async (req, res) => {

  const { codigo } = req.body;

  const session = driver.session();

  try {

    const result = await session.run(
      `
      MATCH (a:Alumno)
      WHERE a.matricula = $codigo
      RETURN a
      `,
      { codigo }
    );

    if (result.records.length > 0) {

      const alumno = result.records[0].get("a").properties;

      return res.json({
        success: true,
        usuario: alumno
      });

    }

    return res.json({
      success: false,
      message: "Alumno no encontrado"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error en QR login"
    });
  } finally {
    await session.close();
  }

});

/* =========================
   PUERTO
========================= */

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Servidor en puerto ${PORT}`
  );

});