const express = require('express');
const fs = require('fs');
const messageHandling = require('./messageHandling');

const router = express.Router();

router.post('/', (req, res) => {
  fs.appendFileSync(
    'debug_payload_log.txt',
    new Date().toISOString() +
      ' - Payload Entrante: ' +
      JSON.stringify(req.body, null, 2) +
      '\n'
  );
  return messageHandling(req, res);
});

module.exports = router;
