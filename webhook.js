const express = require('express');
const router = express.Router();
const handleIncomingMessage = require('./messageHandling');
const verifyToken = process.env.VERIFY_TOKEN;

// Ruta de verificación para Webhook
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Ruta POST para recibir mensajes de WhatsApp
router.post('/webhook', async (req, res) => {
  try {
    if (req.body.object === 'whatsapp') {
      req.body.entry.forEach(async (entry) => {
        const changes = entry.changes[0];
        const value = changes.value;
        const message = value.messages?.[0];
        const phoneNumber = message?.from;

        if (message && phoneNumber) {
          await handleIncomingMessage(message, phoneNumber);
        }
      });

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error en webhook:', error.message);
    res.sendStatus(500);
  }
});

module.exports = router;
