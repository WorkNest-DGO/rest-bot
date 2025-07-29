const axios = require('axios');

async function sendTemplate(templateName, phoneId, to, components = []) {
  const token = process.env.WHATSAPP_TOKEN;

  if (!token) {
    console.warn('⚠️  WHATSAPP_TOKEN no definido');
    return;
  }

  if (!phoneId) {
    console.warn('⚠️  phoneId no definido');
    return;
  }

  const url = `https://graph.facebook.com/v23.0/${phoneId}/messages`;

  try {
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'es_MX' },
          components,
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
  } catch (err) {
    console.error('❌ Error enviando plantilla:', err.response?.data || err.message);
  }
}

module.exports = { sendTemplate };
