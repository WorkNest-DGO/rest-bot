const axios = require('axios');
const fs = require('fs');

async function sendTemplate(templateName, to, components = []) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.PHONE_NUMBER_ID;

  if (!token) {
    console.warn('⚠️  WHATSAPP_TOKEN no definido');
    fs.appendFileSync('api_log.txt', '⚠️  WHATSAPP_TOKEN no definido\n');
    return;
  }

  if (!phoneId) {
    console.warn('⚠️  phoneId no definido');
    fs.appendFileSync('api_log.txt', '⚠️  phoneId no definido\n');
    return;
  }

  if (!to) {
    console.warn('⚠️  to no definido');
    fs.appendFileSync('api_log.txt', '⚠️  to no definido\n');
    return;
  }

  const url = `https://graph.facebook.com/v23.0/${phoneId}/messages`;

  try {
    const api_logend = `📤 Enviando plantilla "${templateName}" a ${to}`;
    console.log(api_logend);
    fs.appendFileSync('api_log.txt', api_logend + '\n');

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'es_MX' },
        ...(components && components.length > 0 ? { components } : {})
      }
    };

    await axios.post(
      url,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ Plantilla '${templateName}' enviada a ${to}`);
    fs.appendFileSync('api_log.txt', `✅ Plantilla '${templateName}' enviada a ${to}\n`);
  } catch (error) {
    console.error('❌ Error enviando plantilla:', error.response?.data || error.message);
    const errLog = `❌ Error al enviar plantilla "${templateName}" a ${to}: ${error.message}`;
    fs.appendFileSync('api_log.txt', errLog + '\n');
  }
}

async function sendText(to, text) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.PHONE_NUMBER_ID;

  if (!token || !phoneId || !to) {
    const warn = '⚠️ Falta token, phoneId o destinatario';
    console.warn(warn);
    fs.appendFileSync('api_log.txt', warn + '\n');
    return;
  }

  const url = `https://graph.facebook.com/v23.0/${phoneId}/messages`;

  try {
    const log = `📤 Enviando texto a ${to}`;
    console.log(log);
    fs.appendFileSync('api_log.txt', log + '\n');

    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
        text: { body: text }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    fs.appendFileSync('api_log.txt', `✅ Texto enviado a ${to}\n`);
  } catch (error) {
    console.error('❌ Error enviando texto:', error.response?.data || error.message);
    fs.appendFileSync('api_log.txt', `❌ Error enviando texto a ${to}: ${error.message}\n`);
  }
}

async function sendWelcomeMessage(to) {
  return sendTemplate('menu_inicio', to);
}

async function sendMainMenu(to) {
  return sendTemplate('menu_inicio', to);
}

async function sendTodayMenu(to, itemsText) {
  const components = itemsText
    ? [{ type: 'body', parameters: [{ type: 'text', text: itemsText }] }]
    : [];
  return sendTemplate('menu_hoy', to, components);
}

async function sendDailyOffers(to, offersText) {
  const components = offersText
    ? [{ type: 'body', parameters: [{ type: 'text', text: offersText }] }]
    : [];
  return sendTemplate('ofertas_dia', to, components);
}

module.exports = {
  sendTemplate,
  sendText,
  sendWelcomeMessage,
  sendMainMenu,
  sendTodayMenu,
  sendDailyOffers,
};
