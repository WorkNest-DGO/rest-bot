const axios = require('axios');
const fs = require('fs');

async function sendTemplate(templateName, phoneId, to) {
  const token = process.env.WHATSAPP_TOKEN;

  if (!token) {
    console.warn('⚠️  WHATSAPP_TOKEN no definido');
    fs.appendFileSync('logs.txt', '⚠️  WHATSAPP_TOKEN no definido\n');
    return;
  }

  if (!phoneId) {
    console.warn('⚠️  phoneId no definido');
    fs.appendFileSync('logs.txt', '⚠️  phoneId no definido\n');
    return;
  }

  if (!to) {
    console.warn('⚠️  to no definido');
    fs.appendFileSync('logs.txt', '⚠️  to no definido\n');
    return;
  }

  const url = `https://graph.facebook.com/v23.0/${phoneId}/messages`;

  try {
    const logSend = `📤 Enviando plantilla "${templateName}" a ${to}`;
    console.log(logSend);
    fs.appendFileSync('logs.txt', logSend + '\n');
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'es_MX' },
          components: [],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ Plantilla '${templateName}' enviada a ${to}`);
    fs.appendFileSync('logs.txt', `✅ Plantilla '${templateName}' enviada a ${to}\n`);
  } catch (error) {
    console.error('❌ Error enviando plantilla:', error.response?.data || error.message);
    const errLog = `❌ Error al enviar plantilla "${templateName}" a ${to}: ${error.message}`;
    fs.appendFileSync('logs.txt', errLog + '\n');
  }
}

module.exports = { sendTemplate };
