require("dotenv").config();
const axios = require('axios');
const fs = require('fs');
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
    console.warn('phoneId, from o msgBody no definidos');
    fs.appendFileSync('logs.txt', 'phoneId, from o msgBody no definidos\n');
    return;
  }

  const to = from.startsWith("521") ? from.replace("521", "52") : from;

  console.log('📥 Mensaje recibido:', msgBody);
  fs.appendFileSync('logs.txt', `📥 Mensaje recibido: ${msgBody}\n`);

  console.log('📞 Enviando a:', to);
  fs.appendFileSync('logs.txt', `📞 Enviando a: ${to}\n`);

  const normalized = String(msgBody).trim().toLowerCase();

  const isGreeting = greetings.includes(normalized);
  console.log('¿Se detectó saludo?', isGreeting);
  fs.appendFileSync('logs.txt', `¿Se detectó saludo? ${isGreeting}\n`);

  if (isGreeting) {
    console.log('Enviando plantilla de saludo');
    fs.appendFileSync('logs.txt', 'Enviando plantilla de saludo\n');
    console.log("📤 Enviando plantilla 'menu_inicio'");
    fs.appendFileSync('logs.txt', "📤 Enviando plantilla 'menu_inicio'\n");
    await sendTemplate('menu_inicio', phoneId, to);
  } else if (normalized === 'ver men\u00fa de hoy') {
    try {
      const { data } = await axios.get('https://grp-ia.com/bitacora-residentes/menu.php');
      const platillos = Array.isArray(data) ? data : [];
      await menuHoy(phoneId, to, platillos);
    } catch (err) {
      console.error('Error fetching menu:', err.message);
      fs.appendFileSync('logs.txt', `Error fetching menu: ${err.message}\n`);
      console.log("📤 Enviando plantilla 'menu_inicio'");
      fs.appendFileSync('logs.txt', "📤 Enviando plantilla 'menu_inicio'\n");
      await sendTemplate('menu_inicio', phoneId, to);
    }
  } else if (normalized === 'ver ofertas del d\u00eda') {
    try {
      const { data } = await axios.get('https://grp-ia.com/bitacora-residentes/ofertas.php');
      const ofertas = Array.isArray(data) ? data : [];
      await ofertasDia(phoneId, to, ofertas);
    } catch (err) {
      console.error('Error fetching ofertas:', err.message);
      fs.appendFileSync('logs.txt', `Error fetching ofertas: ${err.message}\n`);
      console.log("📤 Enviando plantilla 'menu_inicio'");
      fs.appendFileSync('logs.txt', "📤 Enviando plantilla 'menu_inicio'\n");
      await sendTemplate('menu_inicio', phoneId, to);
    }
  } else if (normalized === 'salir') {
    // Could implement an exit option; for now, we just send menu again
    console.log("📤 Enviando plantilla 'menu_inicio'");
    fs.appendFileSync('logs.txt', "📤 Enviando plantilla 'menu_inicio'\n");
    await sendTemplate('menu_inicio', phoneId, to);
  } else {
    console.log('Enviando plantilla como fallback');
    fs.appendFileSync('logs.txt', 'Enviando plantilla como fallback\n');
    console.log("📤 Enviando plantilla 'menu_inicio'");
    fs.appendFileSync('logs.txt', "📤 Enviando plantilla 'menu_inicio'\n");
    await sendTemplate('menu_inicio', phoneId, to);
  }
}

module.exports = handleMessage;
