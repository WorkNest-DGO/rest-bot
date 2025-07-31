const express = require('express');
const fs = require('fs');
const handleIncomingMessage = require('./messageHandling');

const router = express.Router();

router.post('/webhook', async (req, res) => {
  const body = req.body;
  fs.appendFileSync(
    'debug_payload_log.txt',
    new Date().toISOString() + ' - Payload Entrante: ' + JSON.stringify(body, null, 2) + '\n'
  );
router.post("/webhook", async (req, res) => {
  const payload = req.body;

  // Permite manejar ambos tipos de objetos
  if (
    payload.object === "whatsapp" ||
    payload.object === "whatsapp_business_account"
  ) {
    try {
      await handleIncomingMessage(payload);
    } catch (err) {
      console.error("❌ Error en handleIncomingMessage:", err);
    }
  }

  res.sendStatus(200);
});

});

module.exports = router;
