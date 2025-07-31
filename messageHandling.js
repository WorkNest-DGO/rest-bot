const fs = require('fs');
const axios = require('axios');
const {
  templates,
  enviarPlantillaWhatsApp,
  enviarPlantillaErrorGenerico,
  enviarMensajeTexto,
} = require("./whatsappTemplates");

module.exports = async (req, res) => {
  const data = req.body;

  // Log de la solicitud entrante para depuración
  fs.appendFileSync(
    "debug_post_log.txt",
    `${new Date().toISOString()} - POST Request: ${JSON.stringify(data)}\n`
  );

  try {
    const message = data?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.status(400).send("No se encontraron mensajes.");

    const from = message.from;
    const text = message.text?.body?.toLowerCase() || "";
    const buttonReply = message.interactive?.button_reply?.id?.toLowerCase() || "";

    console.log("Mensaje recibido:", text);


    // Palabras clave
    const palabrasClaveSaludo = [
      "hola", "hi", "buen día", "buenos días", "hello", "qué tal", "buenas tardes",
      "buenas noches", "saludos", "hey", "cómo estás", "qué onda",
    ];

    let action = "";

    // Determinar acción
    if (palabrasClaveSaludo.some((saludo) => text.includes(saludo))) {
      action = "saludo";
    } else if (text.trim() == "menu" || text.includes("ver menu de hoy") || buttonReply === "btn_menu_hoy") {
      action = "menu_hoy";
    } else if (text.trim() == "ofertas" || text.includes("ver ofertas del dia") || buttonReply === "btn_ofertas_dia") {
      action = "ofertas_dia";
    } else if (text.includes("salir") || buttonReply === "btn_salir") {
      action = "salir";
    }

    // Procesar acción
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

    res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    console.error("Error procesando el mensaje:", error);
    res.status(500).send("Error interno");
  }
};


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
