const axios = require('axios');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

function sendTemplate(to, templateName, components = []) {
  return axios.post(
    API_URL,
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
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

function menuInicio(to) {
  return sendTemplate(to, 'menu_inicio');
}

function menuHoy(to, platillos) {
  const bodyText = platillos.join('\n');
  return sendTemplate(to, 'menu_hoy', [
    {
      type: 'body',
      parameters: [{ type: 'text', text: bodyText }],
    },
  ]);
}

function ofertasDia(to, ofertas) {
  const bodyText = ofertas.join('\n');
  return sendTemplate(to, 'ofertas_dia', [
    {
      type: 'body',
      parameters: [{ type: 'text', text: bodyText }],
    },
  ]);
}

module.exports = { sendTemplate, menuInicio, menuHoy, ofertasDia };
