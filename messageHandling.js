const fs = require('fs');
const axios = require('axios');
const {
  templates,
  enviarPlantillaWhatsApp,
  enviarPlantillaErrorGenerico,
  enviarMensajeTexto,
} = require("./whatsappTemplates");

async function handleIncomingMessage(data) {

  // Log de la solicitud entrante para depuración
  fs.appendFileSync(
    "debug_post_log.txt",
    `${new Date().toISOString()} - POST Request: ${JSON.stringify(data)}\n`
  );

  try {
    for (const entry of data.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        if (!Array.isArray(value.messages)) {
          continue;
        }

        const message = value.messages[0];
        if (!message) {
          continue;
        }

        const from = message.from;
        let text = "";

        if (message.type === "text") {
          text = message.text?.body?.toLowerCase() || "";
        } else if (message.type === "interactive" && message.interactive?.button_reply?.title) {
          text = message.interactive.button_reply.title.toLowerCase();
        } else {
          continue;
        }

        console.log("Mensaje recibido:", text);

        if (text.includes("hola") || text.includes("buenas") || text.includes("hey")) {
          await enviarPlantillaWhatsApp(from, "menu_inicio");
        } else if (text.includes("menu")) {
          await handleOrdenMenu(from);
        } else if (text.includes("oferta")) {
          await handleOrdenOferta(from);
        } else if (text.includes("salir")) {
          await enviarMensajeTexto(from, "Gracias por tu visita. ¡Hasta pronto!");
        } else {
          console.log("No se encontró una acción correspondiente.");
        }
      }
    }

    fs.appendFileSync(
      'debug_post_log.txt',
      `${new Date().toISOString()} - Mensaje procesado correctamente\n`
    );
  } catch (error) {
    console.error("Error procesando el mensaje:", error);
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
