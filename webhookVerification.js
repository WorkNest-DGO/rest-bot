require("dotenv").config();

exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "Test1234";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Verificación recibida:");
  console.log("mode:", mode, "token:", token, "challenge:", challenge);

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Verificación exitosa");
      return res.status(200).send(challenge);
    } else {
      console.log("Token inválido:", token);
      return res.sendStatus(403);
    }
  } else {
    console.log("Faltan parámetros");
    return res.sendStatus(403);
  }
};
