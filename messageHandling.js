const axios = require('axios');
require('dotenv').config();

const greetings = [
  'hola',
  'buen d\u00eda',
  'buenas tardes',
  'hey',
  'saludos',
  'qu\u00e9 tal',
];

// Envia una plantilla a través de la API de WhatsApp
async function sendTemplate(phoneId, to, templateName, components = []) {
  const token = process.env.WHATSAPP_TOKEN;
  if (!token) {
    console.warn('WHATSAPP_TOKEN no definido');
    return;
  }

  console.log(`Enviando plantilla '${templateName}' a ${to}`);
  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

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
}

function menuHoy(phoneId, to, platillos) {
  const bodyText = platillos.join('\n');
  return sendTemplate(phoneId, to, 'menu_hoy', [
    {
      type: 'body',
      parameters: [{ type: 'text', text: bodyText }],
    },
  ]);
}

function ofertasDia(phoneId, to, ofertas) {
  const bodyText = ofertas.join('\n');
  return sendTemplate(phoneId, to, 'ofertas_dia', [
    {
      type: 'body',
      parameters: [{ type: 'text', text: bodyText }],
    },
  ]);
}

async function handleMessage(phone_number_id, from, text) {
  const normalizedText = (text || '').toLowerCase();
  console.log('Mensaje recibido:', normalizedText, 'de:', from);

  if (greetings.includes(normalizedText)) {
    await sendTemplate(phone_number_id, from, 'menu_inicio');
    console.log('Respuesta enviada a', from);
  } else if (normalizedText === 'ver men\u00fa de hoy') {
    try {
      const { data } = await axios.get('http://127.0.0.1:80/rest/api/whats/menu.php');
      const platillos = Array.isArray(data) ? data : [];
      await menuHoy(phone_number_id, from, platillos);
    } catch (err) {
      console.error('Error fetching menu:', err.message);
      await sendTemplate(phone_number_id, from, 'menu_inicio');
    }
  } else if (normalizedText === 'ver ofertas del d\u00eda') {
    try {
      const { data } = await axios.get('http://127.0.0.1:80/rest/api/whats/ofertas.php');
      const ofertas = Array.isArray(data) ? data : [];
      await ofertasDia(phone_number_id, from, ofertas);
    } catch (err) {
      console.error('Error fetching ofertas:', err.message);
      await sendTemplate(phone_number_id, from, 'menu_inicio');
    }
  } else if (normalizedText === 'salir') {
    // Could implement an exit option; for now, we just send menu again
    await sendTemplate(phone_number_id, from, 'menu_inicio');
  } else {
    await sendTemplate(phone_number_id, from, 'menu_inicio');
  }
}

module.exports = handleMessage;
