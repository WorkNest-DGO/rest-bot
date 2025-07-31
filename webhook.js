const express = require('express');
const fs = require('fs');
const messageHandling = require('./messageHandling');

const router = express.Router();

router.post('/', (req, res) => {
  try {
    fs.appendFileSync(
      'debug_payload_log.txt',
      new Date().toISOString() +
        ' - Payload Entrante: ' +
        JSON.stringify(req.body, null, 2) +
        '\n'
    );
  } catch (err) {
    console.error('Error escribiendo el log:', err);
  }
  
  return messageHandling(req, res);
});

module.exports = router;
