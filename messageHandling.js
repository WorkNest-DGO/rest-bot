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
if (!payload.entry || !Array.isArray(payload.entry)) return;
  try {
    for (const entry of data.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        if (!Array.isArray(value.messages)) {
          continue;
        }

        // Registro de todos los mensajes entrantes
        for (const msg of value.messages) {
          const type = msg.type || "unknown";
          let contenido = "";

          if (type === "text") {
            contenido = msg.text?.body || "";
          } else if (type === "interactive") {
            if (msg.interactive?.button_reply?.title) {
              contenido = msg.interactive.button_reply.title;
            } else if (msg.interactive?.list_reply?.title) {
              contenido = msg.interactive.list_reply.title;
            }
          } else if (type === "image") {
            contenido = "imagen recibida";
          } else if (type === "audio") {
            contenido = "audio recibido";
          } else if (type === "video") {
            contenido = "video recibido";
          } else if (type === "document") {
            contenido = "documento recibido";
          } else if (type === "sticker") {
            contenido = "sticker recibido";
          } else {
            contenido = `${type} recibido`;
          }

          const logLine = `${new Date().toISOString()} - \ud83d\udce9 Mensaje del usuario (type: ${type}): "${contenido}"\n`;
          fs.appendFileSync("debug_payload_log.txt", logLine);
          console.log(`\ud83d\udce9 Mensaje del usuario (type: ${type}): "${contenido}"`);
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
   // Palabras clave
    const palabrasClaveSaludo = [
      "hola", "hi", "buen día", "buenos días", "hello", "qué tal", "buenas tardes",
      "buenas noches", "saludos", "hey", "cómo estás", "qué onda",
    ];
        console.log("Mensaje recibido:", text);

    if (palabrasClaveSaludo.some((saludo) => text.includes(saludo))) {
      action = "saludo";
        } else if (text.includes("menu")|| buttonReply === "btn_menu_hoy") {
           action = "menu_hoy";
        } else if (text.includes("oferta"|| buttonReply === "btn_ofertas_dia")) {
          action = "ofertas_dia";
        } else if (text.includes("salir"|| buttonReply === "btn_salir")) {
         action = "salir";
        } else {
          console.log("No se encontró una acción correspondiente.");
        }
switch (action) {
      case "saludo":
        await enviarPlantillaWhatsApp(from, "menu_inicio");
        break;
      case "menu_hoy":
         await handleOrdenMenu(from);
        break;

      case "ofertas_dia":
         await handleOrdenOferta(from);
        break;

      case "salir":
         await enviarMensajeTexto(from, "Gracias por tu visita. ¡Hasta pronto!");
        break;

      default:
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
