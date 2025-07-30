const axios = require('axios');
require('dotenv').config();

const whatsappApiUrl = 'https://graph.facebook.com/v19.0/';
const phoneId = process.env.PHONE_NUMBER_ID;
const token = process.env.WHATSAPP_TOKEN;

async function sendTemplateMessage(to, templateName, variableText = []) {
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'es_MX' },
    },
  };

  // Validación y depuración
  console.log(`[LOG] Enviando plantilla '${templateName}' con variables:`, variableText);

  if (
    Array.isArray(variableText) &&
    variableText.length > 0 &&
    variableText.every(text => typeof text === 'string' && text.trim() !== '')
  ) {
    payload.template.components = [
      {
        type: 'body',
        parameters: variableText.map(text => ({
          type: 'text',
          text: text.trim(),
        })),
      },
    ];
  }

  try {
    await axios.post(`${whatsappApiUrl}${phoneId}/messages`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(`❌ Error enviando template '${templateName}':`, error.response?.data || error.message);
  }
}

// Plantillas específicas

function sendMenuInicio(to) {
  return sendTemplateMessage(to, 'menu_inicio');
}

function sendMenuHoy(to, menuText) {
  return sendTemplateMessage(to, 'menu_hoy', [menuText]);
}

function sendOfertasDia(to, ofertasText) {
  return sendTemplateMessage(to, 'ofertas_dia', [ofertasText]);
}

function sendTextMessage(to, bodyText) {
  const payload = {
    messaging_product: 'whatsapp',
    to,
    text: { body: bodyText },
  };

  return axios.post(`${whatsappApiUrl}${phoneId}/messages`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(error => {
    console.error('Error enviando mensaje de texto:', error.response?.data || error.message);
  });
}

module.exports = {
  sendMenuInicio,
  sendMenuHoy,
  sendOfertasDia,
  sendTextMessage,
};
