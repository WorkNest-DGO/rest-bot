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
    console.log("🚀 Enviando plantilla:", templateName, "a", to);
    fs.appendFileSync('logs.txt', `Enviando plantilla ${templateName} a ${to}\n`);
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
  } catch (err) {
    console.error('❌ Error enviando plantilla:', err.response?.data || err.message);
    fs.appendFileSync('logs.txt', `Error enviando plantilla: ${err.response?.data || err.message}\n`);
  }
}

module.exports = { sendTemplate };
