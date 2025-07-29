const express = require('express');
const fs = require('fs');
const router = express.Router();
const handleMessage = require('./messageHandling');

// Meta validation endpoint
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const logEntry = `🧪 [GET webhook] mode: ${mode}, token: ${token}, challenge: ${challenge}`;
  console.log(logEntry);
  fs.appendFileSync('logs.txt', logEntry + '\n');

  res.status(200).send(challenge);
});

router.post('/', async (req, res) => {
  try {
    console.log('📨 Webhook recibido:', JSON.stringify(req.body, null, 2));
    fs.appendFileSync('logs.txt', '📨 Mensaje real recibido de WhatsApp\n' + JSON.stringify(req.body) + '\n');

    const body = req.body;
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    const phoneId = value?.metadata?.phone_number_id;
    const from = message?.from;
    const msgBody = message?.text?.body;

    console.log('🆔 phoneId:', phoneId);
    fs.appendFileSync('logs.txt', `🆔 phoneId: ${phoneId}\n`);
    console.log('📱 from:', from);
    fs.appendFileSync('logs.txt', `📱 from: ${from}\n`);
    console.log('💬 msgBody:', msgBody);
    fs.appendFileSync('logs.txt', `💬 msgBody: ${msgBody}\n`);

    if (message?.type === 'text' && phoneId && from && msgBody) {
      await handleMessage(phoneId, from, msgBody);
    }
  } catch (err) {
    console.error('❌ Error al procesar webhook:', err);
    fs.appendFileSync('logs.txt', `Error al procesar webhook: ${err}\n`);
  }

  res.sendStatus(200);
});

module.exports = router;
