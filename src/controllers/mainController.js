const fs = require("fs");
const csv = require("csv-parser");
const iconv = require("iconv-lite");
const path = require("path");

let socios = [];

let totalSocios = 0;
let promedioEdadRacing = 0;
let casadosUniversitarios = [];
let nombresComunesRiver = [];
let equipoStatsList = [];

// Definir las columnas manualmente
const columns = ["nombre", "edad", "equipo", "estado", "estudios"];

// Leer y parsear el archivo CSV con codificación latin1 (ISO-8859-1)
fs.createReadStream("data/socios.csv")
  .pipe(iconv.decodeStream("latin1"))
  .pipe(csv({ headers: columns, separator: ";", skipLines: 0 }))
  .on("data", (row) => {
    // Convertir edad a número
    row.edad = parseInt(row.edad, 10);

    let socio = {
      nombre: row.nombre,
      edad: row.edad,
      equipo: row.equipo,
      estado: row.estado,
      estudios: row.estudios,
    };
    socios.push(socio);
  })
  .on("end", () => {
    // Cantidad total de personas registradas
    totalSocios = socios.length;

    // Promedio de edad de los socios de Racing
    const racingSocios = socios.filter((socio) => socio.equipo === "Racing");
    const totalEdadRacing = racingSocios.reduce(
      (acc, socio) => acc + socio.edad,
      0
    );
    promedioEdadRacing = totalEdadRacing / racingSocios.length;

    // Listado con las 100 primeras personas casadas con estudios universitarios
    casadosUniversitarios = socios
      .filter(
        (socio) =>
          socio.estado === "Casado" && socio.estudios === "Universitario"
      )
      .sort((a, b) => a.edad - b.edad)
      .slice(0, 100)
      .map((socio) => ({
        nombre: socio.nombre,
        edad: socio.edad,
        equipo: socio.equipo,
      }));

    // Los 5 nombres más comunes entre los hinchas de River
    const riverSocios = socios.filter((socio) => socio.equipo === "River");
    const nombreCount = riverSocios.reduce((acc, socio) => {
      acc[socio.nombre] = (acc[socio.nombre] || 0) + 1;
      return acc;
    }, {});
    nombresComunesRiver = Object.entries(nombreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);

    // Listado de equipos con estadísticas de edad
    const equipoStats = socios.reduce((acc, socio) => {
      if (!acc[socio.equipo]) {
        acc[socio.equipo] = {
          totalEdad: 0,
          count: 0,
          minEdad: socio.edad,
          maxEdad: socio.edad,
        };
      }
      acc[socio.equipo].totalEdad += socio.edad;
      acc[socio.equipo].count += 1;
      acc[socio.equipo].minEdad = Math.min(
        acc[socio.equipo].minEdad,
        socio.edad
      );
      acc[socio.equipo].maxEdad = Math.max(
        acc[socio.equipo].maxEdad,
        socio.edad
      );
      return acc;
    }, {});

    equipoStatsList = Object.entries(equipoStats)
      .map(([equipo, stats]) => ({
        equipo,
        promedioEdad: stats.totalEdad / stats.count,
        minEdad: stats.minEdad,
        maxEdad: stats.maxEdad,
      }))
      .sort((a, b) => b.count - a.count);
  });

let pepe = 999999;

const mainController = {
  loading: (req, res) => res.render("loading"),

  result: (req, res) => {
    res.render("result", {
      totalSocios,
      promedioEdadRacing,
      casadosUniversitarios,
      nombresComunesRiver,
      equipoStatsList,
    });
  },
};

module.exports = mainController;
