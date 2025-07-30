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
  fs.appendFileSync('api_log.txt', logEntry + '\n');

  res.status(200).send(challenge);
});

router.post('/', async (req, res) => {
  try {
    console.log('📨 Webhook recibido');
    fs.appendFileSync('api_log.txt', '📨 Webhook recibido\n');

    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    const message = value?.messages?.[0];
    const phoneId = value?.metadata?.phone_number_id;
    const from = message?.from;
    let msgBody = message?.text?.body || message?.interactive?.button_reply?.id;
    msgBody = msgBody
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const msgType = message?.type;
    console.log(`\ud83d\udce4 Tipo de mensaje recibido: ${msgType}`);
    fs.appendFileSync('api_log.txt', `Tipo de mensaje recibido: ${msgType}\n`);

    console.log('🆔 phoneId:', phoneId);
    console.log('📱 from:', from);
    console.log('💬 msgBody:', msgBody);
    fs.appendFileSync('api_log.txt', `🆔 phoneId: ${phoneId}\n`);
    fs.appendFileSync('api_log.txt', `📱 from: ${from}\n`);
    fs.appendFileSync('api_log.txt', `💬 msgBody: ${msgBody}\n`);

    if (!phoneId || !from || !msgBody) {
      console.log('⚠️ Faltan datos esenciales en el mensaje');
      fs.appendFileSync('api_log.txt', '⚠️ Faltan datos esenciales en el mensaje\n');
    } else {
      await handleMessage(phoneId, from, msgBody);
    }
  } catch (err) {
    console.error('❌ Error al procesar webhook:', err);
    fs.appendFileSync('api_log.txt', `Error al procesar webhook: ${err}\n`);
  }

  res.sendStatus(200);
});

module.exports = router;
