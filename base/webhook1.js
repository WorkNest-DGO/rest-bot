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
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Ruta para manejo de verificaciones (GET)
app.get("/webhook", webhookVerification);

// Ruta para manejo de notificaciones entrantes (POST)
app.post("/webhook", messageHandling);

// Ruta adicional para obtener datos de la API externa y mostrar el frontend
const apiBaseUrl = "http://198.251.77.121/api/caja/api/api/liquidacions/numero/";
const authToken =
  "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzaXN0ZW1hIiwiYXV0aCI6IkFMVEFfRU1QTEVBRE9TLERJU0NSRUNJT05BTCxMSVFVSURBQ0lPTl9NQU5VQUwsUk9MRV9BRE1JTiIsInBzdG8iOiJbXSIsIm5tIjoic2lzdGVtYSIsImFwMSI6InNpc3RlbWEiLCJhcDIiOiJzaXN0ZW1hIiwiaWRzdSI6MCwidXNlciI6MTAzNDMsImV4cCI6MTczMzcyMjUwNX0.F1JQ4v07Fq9sewN-4VT_3Q6ufGcrUjJ7wep-P080uLKLc06DDJOSPeOBELKX-cfkwBvvS3BCCD8FuSQim4A4hw";

