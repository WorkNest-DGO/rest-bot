const fs = require('fs');
const axios = require('axios');
const {
  templates,
  enviarPlantillaWhatsApp,
  enviarPlantillaErrorGenerico,
  enviarMensajeTexto,
} = require("./whatsappTemplates");

// Aliases para mayor claridad
const sendTemplateMessage = enviarPlantillaWhatsApp;
const sendTextMessage = enviarMensajeTexto;

async function handleIncomingMessage(payload) {
  // Log de la solicitud entrante para depuración
  fs.appendFileSync(
    "debug_post_log.txt",
    `${new Date().toISOString()} - POST Request: ${JSON.stringify(payload)}\n`
  );

  // Validación básica de la estructura del payload
  const firstEntry = payload.entry?.[0];
  const firstChange = firstEntry?.changes?.[0];
  const firstMessage = firstChange?.value?.messages?.[0];

  if (!firstMessage) {
    console.log("Payload sin mensajes válidos");
    return;
  }

  const message = firstMessage;
  console.log("\ud83d\udce9 Mensaje recibido:", message);

  if (!message.type) return;

  const from = message.from;

  if (message.type === "text") {
    const body = message.text?.body?.toLowerCase() || "";
    if (body.includes("hola")) {
      await sendTemplateMessage(from, "menu_inicio");
    }
  } else if (message.type === "button" && message.button?.payload) {
    const btnPayload = message.button.payload.toLowerCase();
    if (btnPayload === "ver menu de hoy") {
      await sendTemplateMessage(from, "menu_hoy");
    } else if (btnPayload === "ver ofertas del dia") {
      await sendTemplateMessage(from, "ofertas_dia");
    } else if (btnPayload === "salir") {
      await sendTextMessage(from, "¡Gracias por visitarnos!");
    }
  }
}


// Función para manejar "menu dia"
async function handleOrdenMenu(from) {
  const url = 'https://grp-ia.com/bitacora-residentes/menu.php';
  try {
    const { data } = await axios.get(url);

    if (!data || !Array.isArray(data.menu)) {
      fs.appendFileSync(
        'api_log.txt',
        `❌ Error fetching menu: Formato inesperado: 'menu' no es arreglo o está ausente\n${JSON.stringify(data)}\n`
      );
      throw new Error("Formato inesperado: 'menu' no es arreglo o está ausente");
    }

    fs.appendFileSync('api_log.txt', `${url}\n${JSON.stringify(data)}\n`);
    const menuItems = data.menu
      .map(p => `${p.nombre} - $${Number(p.precio).toFixed(2)}`)
      .join(' | ');
    await templates["menu_hoy"](from, menuItems);
  } catch (err) {
    console.error('❌ Error fetching menu:', err.message);
    const resp = err.response ? JSON.stringify(err.response.data) : '';
    fs.appendFileSync(
      'api_log.txt',
      `❌ Error fetching menu: ${err.message}\n${resp}\n`
    );
    await enviarPlantillaErrorGenerico(from, 'No pudimos consultar el menú en este momento.');
  }
}

// Función para manejar "ofertas"
async function handleOrdenOferta(from) {
  const url = 'https://grp-ia.com/bitacora-residentes/ofertas.php';
  try {
    const { data } = await axios.get(url);

    if (!data || !Array.isArray(data.ofertas)) {
      fs.appendFileSync(
        'api_log.txt',
        `❌ Error fetching ofertas: Formato inesperado: 'ofertas' no es arreglo o está ausente\n${JSON.stringify(data)}\n`
      );
      throw new Error("Formato inesperado: 'ofertas' no es arreglo o está ausente");
    }

    fs.appendFileSync('api_log.txt', `${url}\n${JSON.stringify(data)}\n`);
    const ofertasItems = data.ofertas.map(o => o.descripcion).join(' | ');
    await templates["ofertas_dia"](from, ofertasItems);
  } catch (err) {
    console.error('❌ Error fetching ofertas:', err.message);
    const resp = err.response ? JSON.stringify(err.response.data) : '';
    fs.appendFileSync(
      'api_log.txt',
      `❌ Error fetching ofertas: ${err.message}\n${resp}\n`
    );
    await enviarMensajeTexto(from, 'No hay ofertas disponibles.');
  }
}
module.exports = handleIncomingMessage;
