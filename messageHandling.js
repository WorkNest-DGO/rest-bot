const {
  sendTemplate,
  sendMenuInicio,
  sendMenuHoy,
  sendOfertasDia,
  sendTextMessage,
} = require('./whatsappTemplates');
const axios = require('axios');
const fs = require('fs');

// URLS de las APIs (puedes ajustar a tus rutas reales)
const MENU_API = 'https://grp-ia.com/bitacora-residentes/menu.php';
const OFERTAS_API = 'https://grp-ia.com/bitacora-residentes/ofertas.php';

async function getMenuItems() {
  try {
    const { data } = await axios.get('https://grp-ia.com/bitacora-residentes/menu.php');
    fs.appendFileSync('api_log.txt', `[MENÚ] API Response: ${JSON.stringify(data)}\n`);

    if (!data || !Array.isArray(data.menu) || data.menu.length === 0) {
      fs.appendFileSync('api_log.txt', '[MENÚ] No hay datos válidos de menú.\n');
      return '';
    }

    const textoMenu = data.menu.map(item => `${item.nombre} - $${item.precio}`).join(' | ');
    fs.appendFileSync('api_log.txt', `[MENÚ] Texto generado: ${textoMenu}\n`);
    return textoMenu;
  } catch (err) {
    fs.appendFileSync('api_log.txt', `❌ Error al obtener menú: ${err.message}\n`);
    return '';
  }
}

async function getOfertas() {
  try {
    const { data } = await axios.get('https://grp-ia.com/bitacora-residentes/ofertas.php');
    fs.appendFileSync('api_log.txt', `[OFERTAS] API Response: ${JSON.stringify(data)}\n`);

    if (!data || !Array.isArray(data.ofertas) || data.ofertas.length === 0) {
      fs.appendFileSync('api_log.txt', '[OFERTAS] No hay datos válidos de ofertas.\n');
      return '';
    }

    const textoOfertas = data.ofertas.map(item => item.descripcion).join(' | ');
    fs.appendFileSync('api_log.txt', `[OFERTAS] Texto generado: ${textoOfertas}\n`);
    return textoOfertas;
  } catch (err) {
    fs.appendFileSync('api_log.txt', `❌ Error al obtener ofertas: ${err.message}\n`);
    return '';
  }
}

async function handleMessage(from, msgBody) {
  if (msgBody === 'hola' || msgBody === 'menu_inicio') {
    await sendTemplate(from, 'menu_inicio');
    return;
  }

  if (msgBody.includes('menú') || msgBody.includes('menu')) {
    const menuString = await getMenuItems();
    fs.appendFileSync('api_log.txt', `[MENÚ-TEXTO] Activado por texto: "${msgBody}"\n`);
    if (menuString && menuString.trim()) {
      await sendMenuHoy(from, menuString);
    } else {
      await sendTextMessage(from, 'No hay menú disponible en este momento.');
    }
    return;
  }

  if (msgBody.includes('oferta')) {
    const ofertasString = await getOfertas();
    fs.appendFileSync('api_log.txt', `[OFERTAS-TEXTO] Activado por texto: "${msgBody}"\n`);
    if (ofertasString && ofertasString.trim()) {
      await sendOfertasDia(from, ofertasString);
    } else {
      await sendTextMessage(from, 'No hay ofertas disponibles en este momento.');
    }
    return;
  }

  if (msgBody.includes('salir')) {
    await sendTextMessage(from, 'Gracias por visitarnos. ¡Buen provecho!');
    fs.appendFileSync('api_log.txt', `[SALIR-TEXTO] Activado por texto: "${msgBody}"\n`);
    return;
  }

  await sendMenuInicio(from);
}

async function handleIncomingMessage(message, phone) {
  switch (message.type) {
    case 'text':
      const textBody = message.text?.body || '';
      const cleanText = textBody.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      await handleMessage(phone, cleanText);
      break;

    case 'interactive':
      const interaction = message.interactive;
      const buttonId = interaction.button_reply?.id || interaction.list_reply?.id;

      switch (buttonId) {
        case 'ver_menu':
          const menuString = await getMenuItems();
          console.log('[LOG] Menú generado:', menuString);
          if (menuString && menuString.trim()) {
            await sendMenuHoy(phone, menuString);
          } else {
            await sendTextMessage(phone, 'No hay menú disponible en este momento.');
          }
          break;

        case 'ver_ofertas':
          const ofertasString = await getOfertas();
          console.log('[LOG] Ofertas generadas:', ofertasString);
          if (ofertasString && ofertasString.trim()) {
            await sendOfertasDia(phone, ofertasString);
          } else {
            await sendTextMessage(phone, 'No hay ofertas disponibles en este momento.');
          }
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

module.exports = {
  handleIncomingMessage,
  handleMessage,
};
