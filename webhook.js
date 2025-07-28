const express = require('express');
const router = express.Router();
const handleMessage = require('./messageHandling');

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    console.log(JSON.stringify(body, null, 2));

    if (body.object) {
      const entry = body.entry && body.entry[0];
      const changes = entry && entry.changes && entry.changes[0];
      const value = changes && changes.value;
      const message = value && value.messages && value.messages[0];

      if (message && message.text) {
        const phone_number_id = value?.metadata?.phone_number_id;
        console.log('📞 Enviando desde phone_number_id:', phone_number_id);
        if (!phone_number_id) {
          console.warn('phone_number_id no encontrado en el webhook');
        } else {
          const from = message.from;
          const text = message.text.body;
          await handleMessage(phone_number_id, from, text);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error al enviar mensaje:', err);
  }
  res.sendStatus(200);
});

module.exports = router;
