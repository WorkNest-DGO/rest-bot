const {
  sendMenuInicio,
  sendMenuHoy,
  sendOfertasDia,
  sendTextMessage,
} = require('./whatsappTemplates');
const axios = require('axios');

// URLS de las APIs (puedes ajustar a tus rutas reales)
const MENU_API = 'https://grp-ia.com/bitacora-residentes/menu.php';
const OFERTAS_API = 'https://grp-ia.com/bitacora-residentes/ofertas.php';

async function getMenuItems() {
  try {
    const response = await axios.get(MENU_API);
    return response.data.menu.map(item => `${item.nombre} - $${item.precio}`).join('\n');
  } catch (error) {
    console.error('Error al obtener menú:', error.message);
    return 'No pudimos cargar el menú en este momento.';
  }
}

async function getOfertas() {
  try {
    const response = await axios.get(OFERTAS_API);
    return response.data.ofertas.map(o => o.descripcion).join('\n');
  } catch (error) {
    console.error('Error al obtener ofertas:', error.message);
    return 'No pudimos cargar las ofertas en este momento.';
  }
}

async function handleIncomingMessage(message, phone) {
  switch (message.type) {
    case 'text':
      await sendMenuInicio(phone);
      break;

    case 'interactive':
      const interaction = message.interactive;
      const buttonId = interaction.button_reply?.id || interaction.list_reply?.id;

      switch (buttonId) {
        case 'ver_menu':
          const menuString = await getMenuItems();
          await sendMenuHoy(phone, menuString);
          break;

        case 'ver_ofertas':
          const ofertasString = await getOfertas();
          await sendOfertasDia(phone, ofertasString);
          break;

        case 'salir':
          await sendTextMessage(phone, 'Gracias por visitarnos. ¡Buen provecho!');
          break;

        default:
          await sendTextMessage(phone, 'Opción no válida. Por favor, intenta de nuevo.');
      }
      break;

    default:
      await sendTextMessage(phone, 'No pude entender tu mensaje. ¿Podrías intentarlo de nuevo?');
  }
}

module.exports = handleIncomingMessage;
