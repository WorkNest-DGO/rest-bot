const axios = require('axios');
const { menuInicio, menuHoy, ofertasDia } = require('./whatsappTemplates');

async function handleMessage(message) {
  const from = message.from;
  const text = message.text?.body?.toLowerCase() || '';

  if (text === 'ver men\u00fa de hoy') {
    try {
      const { data } = await axios.get('http://127.0.0.1/rest/api/menu');
      const platillos = Array.isArray(data) ? data : [];
      await menuHoy(from, platillos);
    } catch (err) {
      console.error('Error fetching menu:', err.message);
      await menuInicio(from);
    }
  } else if (text === 'ver ofertas del d\u00eda') {
    try {
      const { data } = await axios.get('http://127.0.0.1/rest/api/ofertas');
      const ofertas = Array.isArray(data) ? data : [];
      await ofertasDia(from, ofertas);
    } catch (err) {
      console.error('Error fetching ofertas:', err.message);
      await menuInicio(from);
    }
  } else if (text === 'salir') {
    // Could implement an exit option; for now, we just send menu again
    await menuInicio(from);
  } else {
    await menuInicio(from);
  }
}

module.exports = handleMessage;
