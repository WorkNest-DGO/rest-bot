const fs = require("fs");

// Token de verificación (debe coincidir con el configurado en la plataforma de WhatsApp)
const verifyToken = "test123";

// Ruta para manejar la verificación (GET)
module.exports = (req, res) => {
  const hubVerifyToken = req.query["hub.verify_token"];
  const hubChallenge = req.query["hub.challenge"];

  // Log para depuración
  fs.appendFileSync(
    "debug_get_log.txt",
    `${new Date().toISOString()} - GET Request: ${JSON.stringify(req.query)}\n`
  );

  if (hubVerifyToken === verifyToken) {
    res.status(200).send(hubChallenge); // Responder con el desafío
  } else {
    fs.appendFileSync(
      "debug_get_log.txt",
      `${new Date().toISOString()} - Token Incorrecto: ${hubVerifyToken}\n`
    );
    res.status(403).send("Verificación fallida");
  }
};
