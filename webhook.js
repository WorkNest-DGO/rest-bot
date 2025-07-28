const handleMessage = require('./messageHandling');

module.exports = async function webhook(req, res) {
  const body = req.body;

  if (body.object) {
    const entry = body.entry && body.entry[0];
    const changes = entry && entry.changes && entry.changes[0];
    const value = changes && changes.value;
    const message = value && value.messages && value.messages[0];

    if (message) {
      await handleMessage(message);
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
};
