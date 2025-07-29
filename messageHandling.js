require("dotenv").config();
const axios = require('axios');
const fs = require('fs');
const { sendTemplate } = require('./whatsappTemplates');

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
  return sendTemplate('ofertas_dia', to, [
    {
      type: 'body',
      parameters: [{ type: 'text', text: bodyText }],
    },
  ]);
}

async function handleMessage(phoneId, from, msgBody) {
  if (!phoneId || !from || !msgBody) {
    console.warn('phoneId, from o msgBody no definidos');
    fs.appendFileSync('api_log.txt', 'phoneId, from o msgBody no definidos\n');
    return;
  }

  const to = from.startsWith("521") ? from.replace("521", "52") : from;

  const logMsg = `📥 Mensaje recibido: "${msgBody}" de ${from} → enviado a ${to}`;
  console.log(logMsg);
  fs.appendFileSync('api_log.txt', logMsg + '\n');

  const normalized = removeAccents(String(msgBody).trim().toLowerCase());

  const isGreeting = greetings.includes(normalized);
  console.log('¿Se detectó saludo?', isGreeting);
  fs.appendFileSync('api_log.txt', `¿Se detectó saludo? ${isGreeting}\n`);

  if (isGreeting) {
    console.log('Enviando plantilla de saludo');
    fs.appendFileSync('api_log.txt', 'Enviando plantilla de saludo\n');
    console.log("📤 Enviando plantilla 'menu_inicio'");
    fs.appendFileSync('api_log.txt', "📤 Enviando plantilla 'menu_inicio'\n");
    await sendTemplate('menu_inicio', to);
  } else if (normalized === 'menu_hoy') {
    const menuItems = '• Enchiladas\n• Tacos dorados\n• Agua de horchata';
    await sendTemplate('menu_hoy', to, [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: menuItems,
          },
        ],
      },
    ]);
  } else if (normalized === 'ver ofertas del d\u00eda' || normalized === 'ofertas_dia') {
    try {
      const { data } = await axios.get('https://grp-ia.com/bitacora-residentes/ofertas.php');
      const ofertas = Array.isArray(data) ? data : [];
      await ofertasDia(to, ofertas);
    } catch (err) {
      console.error('Error fetching ofertas:', err.message);
      fs.appendFileSync('api_log.txt', `Error fetching ofertas: ${err.message}\n`);
      console.log("📤 Enviando plantilla 'menu_inicio'");
      fs.appendFileSync('api_log.txt', "📤 Enviando plantilla 'menu_inicio'\n");
      await sendTemplate('menu_inicio', to);
    }
  } else if (normalized === 'salir') {
    // Could implement an exit option; for now, we just send menu again
    console.log("📤 Enviando plantilla 'menu_inicio'");
    fs.appendFileSync('api_log.txt', "📤 Enviando plantilla 'menu_inicio'\n");
    await sendTemplate('menu_inicio', to);
  } else {
    console.log('Enviando plantilla como fallback');
    fs.appendFileSync('api_log.txt', 'Enviando plantilla como fallback\n');
    console.log("📤 Enviando plantilla 'menu_inicio'");
    fs.appendFileSync('api_log.txt', "📤 Enviando plantilla 'menu_inicio'\n");
    await sendTemplate('menu_inicio', to);
  }
}

module.exports = handleMessage;
