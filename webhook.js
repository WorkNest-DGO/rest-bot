const express = require("express");
const webhookVerification = require("./webhookVerification");
const messageHandling = require("./messageHandling");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

// Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:3001",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Ruta para manejo de verificaciones (GET)
app.get("/webhook", webhookVerification);

// Ruta para manejo de notificaciones entrantes (POST)
app.post("/webhook", messageHandling);
