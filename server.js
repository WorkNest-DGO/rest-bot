require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { verifyWebhook } = require("./webhookVerification");
const webhookRoutes = require("./webhook");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Ruta de verificación (GET)
app.get("/webhook", verifyWebhook);

// Ruta de recepción de mensajes (POST)
app.use("/webhook", webhookRoutes);

app.listen(PORT, () => {
  console.log(`Webhook listening on port ${PORT}`);
});
