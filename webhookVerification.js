require("dotenv").config();
const fs = require('fs');

exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "Test1234";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Verificación recibida:");
  fs.appendFileSync('logs.txt', 'Verificación recibida:\n');
  console.log("mode:", mode, "token:", token, "challenge:", challenge);
  fs.appendFileSync('logs.txt', `mode: ${mode} token: ${token} challenge: ${challenge}\n`);

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Verificación exitosa");
      fs.appendFileSync('logs.txt', 'Verificación exitosa\n');
      return res.status(200).send(challenge);
    } else {
      console.log("Token inválido:", token);
      fs.appendFileSync('logs.txt', `Token inválido: ${token}\n`);
      return res.sendStatus(403);
    }
  } else {
    console.log("Faltan parámetros");
    fs.appendFileSync('logs.txt', 'Faltan parámetros\n');
    return res.sendStatus(403);
  }
};
