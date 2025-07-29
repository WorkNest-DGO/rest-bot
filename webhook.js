const express = require('express');
const router = express.Router();
const handleMessage = require('./messageHandling');

router.post('/', async (req, res) => {
  try {
    console.log(
      "📨 Webhook recibido:",
      JSON.stringify(req.body, null, 2)
    );

    const body = req.body;
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    const phoneId = value?.metadata?.phone_number_id;
    const from = message?.from;
    const msgBody = message?.text?.body;

    console.log("🆔 phoneId:", phoneId);
    console.log("📱 from:", from);
    console.log("💬 msgBody:", msgBody);

    if (message?.type === "text" && phoneId && from && msgBody) {
      await handleMessage(phoneId, from, msgBody);
    }
  } catch (err) {
    console.error('❌ Error al procesar webhook:', err);
  }

  res.sendStatus(200);
});

module.exports = router;
