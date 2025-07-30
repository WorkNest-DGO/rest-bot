const fs = require('fs');

function verifyWebhook(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'test-token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  fs.appendFileSync(
    'debug_get_log.txt',
    `${new Date().toISOString()} - GET Request: ${JSON.stringify(req.query)}\n`
  );

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    fs.appendFileSync(
      'debug_get_log.txt',
      `${new Date().toISOString()} - Token Incorrecto: ${token}\n`
    );
    res.sendStatus(403);
  }
}

module.exports = { verifyWebhook };
