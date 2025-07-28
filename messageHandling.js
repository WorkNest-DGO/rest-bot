const axios = require('axios');
const { sendTemplate, menuHoy, ofertasDia } = require('./whatsappTemplates');

async function handleMessage(phone_number_id, from, text) {
  const normalizedText = (text || '').toLowerCase();
  console.log('Mensaje recibido:', normalizedText, 'de:', from);

  const greetings = [
    'hola',
    'buen d\u00eda',
    'buenas tardes',
    'hey',
    'saludos',
    'qu\u00e9 tal',
  ];

  if (greetings.includes(normalizedText)) {
    await sendTemplate(from, 'menu_inicio');
    console.log('Respuesta enviada a', from);
  } else if (normalizedText === 'ver men\u00fa de hoy') {
    try {
      const { data } = await axios.get('http://127.0.0.1/rest/api/menu');
      const platillos = Array.isArray(data) ? data : [];
      await menuHoy(from, platillos);
    } catch (err) {
      console.error('Error fetching menu:', err.message);
      await sendTemplate(from, 'menu_inicio');
    }
  } else if (normalizedText === 'ver ofertas del d\u00eda') {
    try {
      const { data } = await axios.get('http://127.0.0.1/rest/api/ofertas');
      const ofertas = Array.isArray(data) ? data : [];
      await ofertasDia(from, ofertas);
    } catch (err) {
      console.error('Error fetching ofertas:', err.message);
      await sendTemplate(from, 'menu_inicio');
    }
  } else if (normalizedText === 'salir') {
    // Could implement an exit option; for now, we just send menu again
    await sendTemplate(from, 'menu_inicio');
  } else {
    await sendTemplate(from, 'menu_inicio');
  }
}

module.exports = handleMessage;
