const express = require("express");
const path = require("path");
const app = express();

// Archivos Estaticos
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Routing
const mainRouter = require("./routes/main");

// Routing
app.use("/", mainRouter);
app.use("/result", mainRouter);

app.listen(4000, () =>
  console.log("Levantando un servidor con Express en", "http://localhost:4000")
);
