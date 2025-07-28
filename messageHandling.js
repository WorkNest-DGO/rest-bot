require('dotenv').config();
const axios = require('axios');

const greetings = [
  'hola',
  'buenos d\u00edas',
  'buenas tardes',
  'hey',
  'qu\u00e9 tal',
  'saludos',
];

// Envia una plantilla a través de la API de WhatsApp
async function sendTemplate(phoneId, to, templateName, components = []) {
  const token = process.env.WHATSAPP_TOKEN;
  if (!token) {
    console.error('❌ WHATSAPP_TOKEN no definido');
    return;
  }

  console.log(`Enviando plantilla '${templateName}' a ${to}`);
  const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

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
  const phoneId = phone_number_id;
  const to = from;
  const msgBody = (text || '').trim().toLowerCase();

  console.log('Texto recibido:', msgBody);

  if (!phoneId || !to || !msgBody) {
    console.warn('phoneId, to o msgBody no definidos');
    return;
  }

  const isGreeting = greetings.includes(msgBody);
  console.log('¿Se detectó saludo?', isGreeting);

  if (isGreeting) {
    await sendTemplate(phoneId, to, 'menu_inicio');
    console.log('Respuesta enviada a', to);
  } else if (msgBody === 'ver men\u00fa de hoy') {
    try {
      const { data } = await axios.get('http://127.0.0.1:80/rest/api/whats/menu.php');
      const platillos = Array.isArray(data) ? data : [];
      await menuHoy(phoneId, to, platillos);
    } catch (err) {
      console.error('Error fetching menu:', err.message);
      await sendTemplate(phoneId, to, 'menu_inicio');
    }
  } else if (msgBody === 'ver ofertas del d\u00eda') {
    try {
      const { data } = await axios.get('http://127.0.0.1:80/rest/api/whats/ofertas.php');
      const ofertas = Array.isArray(data) ? data : [];
      await ofertasDia(phoneId, to, ofertas);
    } catch (err) {
      console.error('Error fetching ofertas:', err.message);
      await sendTemplate(phoneId, to, 'menu_inicio');
    }
  } else if (msgBody === 'salir') {
    // Could implement an exit option; for now, we just send menu again
    await sendTemplate(phoneId, to, 'menu_inicio');
  } else {
    console.log('Enviando plantilla como fallback');
    await sendTemplate(phoneId, to, 'menu_inicio');
  }
}

module.exports = handleMessage;
