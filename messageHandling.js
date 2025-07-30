require("dotenv").config();
const axios = require('axios');
const fs = require('fs');
const {
  sendTemplate,
  sendText,
  sendWelcomeMessage,
  sendMainMenu,
  sendTodayMenu,
  sendDailyOffers,
} = require('./whatsappTemplates');

const greetings = [
  'hola',
  'buenos dias',
  'buenas tardes',
  'hey',
  'que tal',
  'saludos',
];

const removeAccents = (text) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');


function ofertasDia(to, ofertas) {
  const bodyText = ofertas.join('\n');
  return sendDailyOffers(to, bodyText);
}

async function menuHoy(to, platillos) {
  const bodyText = platillos.join ? platillos.join('\n') : platillos;
  return sendTodayMenu(to, bodyText);
}

async function processMenuHoy(to) {
  try {
    const { data } = await axios.get('https://grp-ia.com/bitacora-residentes/ofertas.php');

    if (!data || !Array.isArray(data.menu)) {
      throw new Error("Formato inesperado: 'menu' no es arreglo o está ausente");
    }

    const platillos = data.menu.map(item => `${item.nombre} $${item.precio}`).join(' | ');
    await menuHoy(to, platillos);
  } catch (err) {
    console.error('❌ Error fetching menu:', err.message);
    fs.appendFileSync('api_log.txt', `❌ Error fetching menu: ${err.message}\n`);
    await sendText(to, 'No pudimos consultar el menú en este momento.');
  }
}

async function processOfertasDia(to) {
  try {
    const { data } = await axios.get('https://grp-ia.com/bitacora-residentes/ofertas.php');

    if (!data || !Array.isArray(data.ofertas)) {
      throw new Error("Formato inesperado: 'ofertas' no es arreglo o está ausente");
    }

    const ofertas = data.ofertas.map(item => `${item.descripcion}`).join(' | ');
    await ofertasDia(to, ofertas);
  } catch (err) {
    console.error('❌ Error fetching ofertas:', err.message);
    fs.appendFileSync('api_log.txt', `❌ Error fetching ofertas: ${err.message}\n`);
    await sendText(to, 'No hay ofertas disponibles.');
  }
}

async function handleIncomingMessage(phoneId, from, message) {
  if (!phoneId || !from || !message) {
    console.warn('phoneId, from o message no definidos');
    fs.appendFileSync('api_log.txt', 'phoneId, from o message no definidos\n');
    return;
  }

  const to = from.startsWith("521") ? from.replace("521", "52") : from;

  const logMsg = `📥 Mensaje recibido tipo ${message.type} de ${from} → enviado a ${to}`;
  console.log(logMsg);
  fs.appendFileSync('api_log.txt', logMsg + '\n');

  switch (message.type) {
    case 'text': {
      const body = message.text?.body || '';
      const normalized = removeAccents(body.trim().toLowerCase());
      const isGreeting = greetings.includes(normalized) || normalized === 'hola';
      if (isGreeting) {
        await sendWelcomeMessage(to);
      } else if (normalized === 'menu_hoy') {
        await processMenuHoy(to);
      } else if (normalized === 'ofertas_dia') {
        await processOfertasDia(to);
      } else {
        await sendMainMenu(to);
      }
      break;
    }
    case 'interactive': {
      const id =
        message.interactive?.button_reply?.id ||
        message.interactive?.list_reply?.id || '';
      switch (id) {
        case 'menu_hoy':
          await processMenuHoy(to);
          break;
        case 'ofertas_dia':
          await processOfertasDia(to);
          break;
        case 'salir':
          await sendMainMenu(to);
          break;
        default:
          await sendMainMenu(to);
      }
      break;
    }
    default:
      console.log('Tipo de mensaje no soportado');
  }
}

module.exports = handleIncomingMessage;
