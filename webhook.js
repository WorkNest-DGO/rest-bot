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
  if (body.object === 'whatsapp') {
    await handleIncomingMessage(body);
  }
  res.sendStatus(200);
});

module.exports = router;
