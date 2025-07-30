
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const {
  enviarPlantillaWhatsApp,
  enviarPlantillaWhatsApp2,
  enviarPlantillaOferta,
  enviarPlantillaMenu,
  enviarPlantillaErrorGenerico
} = require("./whatsappTemplates");

const negocio = "Tokyo Sushi Prime";
const apiUrlOferta = "https://grp-ia.com/bitacora-residentes/ofertas.php";
const apiUrlMenu = "https://grp-ia.com/bitacora-residentes/ofertas.php";
const authToken =   "Bearer EAALCD9w1tyQBPNcZBxgrxbvJbn3qxyojxs55Mgu3z0Qlh3JzcHoOBLxED2vZCKiPqJefkZA1rDYEdlsIZBAynwMnLoq65yB1Y6EPkZB7BZAZCMtnqfewEGPZAkRsOb5y6AawvxAUIF4S3bH8wfsfgm4PBzMwIA3Ka2omjlomNLUAlVAbZBW2rmbnR0SSp9OzNCp7q7AZDZD";
// Token truncado para simplificación

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
    } else if (text.includes("Ver menu de hoy") || buttonReply === "btn_menu_hoy") {
      action = "menu_hoy";
    } else if (text.includes("Ver ofertas del dia") || buttonReply === "btn_ofertas_dia") {
      action = "ofertas_dia";
    } else if (text.includes("salir") || buttonReply === "btn_salir") {
      action = "salir";
    } 

    // Procesar acción
    switch (action) {
      case "saludo":
        await enviarPlantillaWhatsApp(from, "saludo_inicial");
        break;

      case "menu_hoy":
        await handleOrdenMenu(from, extractedValue);
        break;

      case "ofertas_dia":
        await handleOrdenOferta(from, extractedValue);
        break;

      case "salir":
        await enviarPlantillaWhatsApp2(from, "salir");
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

    const platillos = data.menu.map(item => `${item.nombre} $${item.precio}`).join(' | ');
    await enviarPlantillaMenu(from, menu);
  } catch (err) {
    console.error('❌ Error fetching menu:', err.message);
    fs.appendFileSync('api_log.txt', `❌ Error fetching menu: ${err.message}\n`);
    await enviarPlantillaErrorGenerico(to, 'No pudimos consultar el menú en este momento.');
  }
}

// Función para manejar "ofertas"
async function handleOrdenOferta(from, extractedValue) {
  try {
    const { data } = await axios.get('https://grp-ia.com/bitacora-residentes/ofertas.php');

    if (!data || !Array.isArray(data.ofertas)) {
      throw new Error("Formato inesperado: 'ofertas' no es arreglo o está ausente");
    }

    const ofertas = data.ofertas.map(item => `${item.descripcion}`).join(' | ');
    await enviarPlantillaOferta(from, ofertas);
  } catch (err) {
    console.error('❌ Error fetching ofertas:', err.message);
    fs.appendFileSync('api_log.txt', `❌ Error fetching ofertas: ${err.message}\n`);
    await sendText(to, 'No hay ofertas disponibles.');
  }
}

async function handleIncomingMessage(phoneId, from, message) {
  if (!phoneId || !from || !message) {
    console.warn('phoneId, from o message no definidos');
    fs.appendFileSync('api_log.txt', 'phoneId, from o message no definidos\n');
    return;
  }
