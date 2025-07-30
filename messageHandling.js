const fs = require('fs');
const axios = require('axios');
const {
  templates,
  enviarPlantillaWhatsApp,
  enviarPlantillaOferta,
  enviarPlantillaMenu,
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

    if (text.includes("ofertas")) {
      try {
        const response = await axios.get("http://localhost:3000/api/ofertas");
        const ofertas = response.data.ofertas || [];
        if (ofertas.length === 0) throw new Error("Sin ofertas");

        await templates["ofertas_dia"](from, ofertas);
        console.log("Enviada plantilla ofertas_dia");
      } catch (err) {
        console.error("❌ Error al obtener ofertas:", err.message);
        await enviarMensajeTexto(from, "No pudimos consultar las ofertas del día.");
      }
      return res.status(200).send("EVENT_RECEIVED");
    }

    // Palabras clave
    const palabrasClaveSaludo = [
      "hola", "hi", "buen día", "buenos días", "hello", "qué tal", "buenas tardes",
      "buenas noches", "saludos", "hey", "cómo estás", "qué onda",
    ];

    let action = "";
    let extractedValue = "";

    // Determinar acción
    if (palabrasClaveSaludo.some((saludo) => text.includes(saludo))) {
      action = "saludo";
    } else if (text.includes("ver menu de hoy") || buttonReply === "btn_menu_hoy") {
      action = "menu_hoy";
    } else if (text.includes("ver ofertas del dia") || text.includes("ofertas") || buttonReply === "btn_ofertas_dia") {
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
        await handleOrdenMenu(from, extractedValue);
        break;

      case "ofertas_dia":
        await handleOrdenOferta(from, extractedValue);
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
async function handleOrdenMenu(from, extractedValue) {
    try {
    const { data } = await axios.get('https://grp-ia.com/bitacora-residentes/ofertas.php');

    if (!data || !Array.isArray(data.menu)) {
      throw new Error("Formato inesperado: 'menu' no es arreglo o está ausente");
    }

    fs.appendFileSync('api_log.txt', `${JSON.stringify(data)}\n`);
    const platillos = data.menu.map(item => `${item.nombre} $${item.precio}`).join(' | ');
    await enviarPlantillaMenu(from, platillos);
  } catch (err) {
    console.error('❌ Error fetching menu:', err.message);
    fs.appendFileSync('api_log.txt', `❌ Error fetching menu: ${err.message}\n`);
    await enviarPlantillaErrorGenerico(from, 'No pudimos consultar el menú en este momento.');
  }
}

// Función para manejar "ofertas"
async function handleOrdenOferta(from, extractedValue) {
  try {
    const { data } = await axios.get('https://grp-ia.com/bitacora-residentes/ofertas.php');

    if (!data || !Array.isArray(data.ofertas)) {
      throw new Error("Formato inesperado: 'ofertas' no es arreglo o está ausente");
    }

    fs.appendFileSync('api_log.txt', `${JSON.stringify(data)}\n`);
    const ofertas = data.ofertas.map(item => `${item.descripcion}`).join(' | ');
    await enviarPlantillaOferta(from, ofertas);
  } catch (err) {
    console.error('❌ Error fetching ofertas:', err.message);
    fs.appendFileSync('api_log.txt', `❌ Error fetching ofertas: ${err.message}\n`);
    await enviarMensajeTexto(from, 'No hay ofertas disponibles.');
  }
}
