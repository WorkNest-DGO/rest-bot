const express = require('express');
const router = express.Router();
const handleMessage = require('./messageHandling');

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    console.log(JSON.stringify(body, null, 2));

    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    const phoneId = value?.metadata?.phone_number_id;
    const from = message?.from;
    const msgBody = message?.text?.body;

    if (msgBody) {
      console.log(`📩 Webhook message from ${from}: ${msgBody}`);
      await handleMessage(phoneId, from, msgBody);
    }
  } catch (err) {
    console.error('❌ Error al procesar webhook:', err);
  }

  res.sendStatus(200);
});

module.exports = router;
