require("dotenv").config();
const axios = require('axios');
const { sendTemplate } = require('./whatsappTemplates');

const greetings = [
  'hola',
  'buenos d\u00edas',
  'buenas tardes',
  'hey',
  'qu\u00e9 tal',
  'saludos',
];


function menuHoy(phoneId, to, platillos) {
  const bodyText = platillos.join('\n');
  return sendTemplate('menu_hoy', phoneId, to, [
    {
      type: 'body',
      parameters: [{ type: 'text', text: bodyText }],
    },
  ]);
}

function ofertasDia(phoneId, to, ofertas) {
  const bodyText = ofertas.join('\n');
  return sendTemplate('ofertas_dia', phoneId, to, [
    {
      type: 'body',
      parameters: [{ type: 'text', text: bodyText }],
    },
  ]);
}

async function handleMessage(phoneId, from, msgBody) {
  if (!phoneId || !from || !msgBody) {
    console.warn('phoneId, to o msgBody no definidos');
    return;
  }

  const to = from.startsWith("521") ? from.replace("521", "52") : from;
  console.log("📞 Número corregido para envío:", to);

  const normalized = String(msgBody).trim().toLowerCase();
  console.log("📥 Mensaje recibido:", normalized);

  const isGreeting = greetings.includes(normalized);
  console.log('¿Se detectó saludo?', isGreeting);

  if (isGreeting) {
    console.log('Enviando plantilla de saludo');
    console.log("📤 Enviando plantilla 'menu_inicio'");
    await sendTemplate('menu_inicio', phoneId, to);
  } else if (normalized === 'ver men\u00fa de hoy') {
    try {
      const { data } = await axios.get('http://127.0.0.1:80/rest/api/whats/menu.php');
      const platillos = Array.isArray(data) ? data : [];
      await menuHoy(phoneId, to, platillos);
    } catch (err) {
      console.error('Error fetching menu:', err.message);
      console.log("📤 Enviando plantilla 'menu_inicio'");
      await sendTemplate('menu_inicio', phoneId, to);
    }
  } else if (normalized === 'ver ofertas del d\u00eda') {
    try {
      const { data } = await axios.get('http://127.0.0.1:80/rest/api/whats/ofertas.php');
      const ofertas = Array.isArray(data) ? data : [];
      await ofertasDia(phoneId, to, ofertas);
    } catch (err) {
      console.error('Error fetching ofertas:', err.message);
      console.log("📤 Enviando plantilla 'menu_inicio'");
      await sendTemplate('menu_inicio', phoneId, to);
    }
  } else if (normalized === 'salir') {
    // Could implement an exit option; for now, we just send menu again
    console.log("📤 Enviando plantilla 'menu_inicio'");
    await sendTemplate('menu_inicio', phoneId, to);
  } else {
    console.log('Enviando plantilla como fallback');
    console.log("📤 Enviando plantilla 'menu_inicio'");
    await sendTemplate('menu_inicio', phoneId, to);
  }
}

module.exports = handleMessage;
