const express = require('express');
const router = express.Router();
const handleMessage = require('./messageHandling');

router.post('/', async (req, res) => {
  const body = req.body;

  if (body.object) {
    try {
      const entry = body.entry && body.entry[0];
      const changes = entry && entry.changes && entry.changes[0];
      const value = changes && changes.value;
      const message = value && value.messages && value.messages[0];

      if (message && message.text) {
        const phoneNumberId = value.metadata && value.metadata.phone_number_id;
        const from = message.from;
        const text = message.text.body;
        await handleMessage(phoneNumberId, from, text);
      }
      res.sendStatus(200);
    } catch (err) {
      console.error('Error al procesar el webhook:', err);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;
