const express = require('express');
const fs = require('fs');
const messageHandling = require('./messageHandling');

const router = express.Router();


router.post('/', (req, res) => {
  const log = `${new Date().toISOString()} - Payload Entrante: ${JSON.stringify(req.body, null, 2)}\n`;
  fs.appendFileSync('debug_payload_log.txt', log);
  console.log('📩 Mensaje recibido en /webhook');
  
  return messageHandling(req, res);
});

module.exports = router;
