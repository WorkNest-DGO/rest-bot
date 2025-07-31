const fs = require("fs");
const path = require("path");
const {
  templates,
  enviarPlantillaWhatsApp,
  enviarPlantillaErrorGenerico,
  enviarMensajeTexto,
} = require("./whatsappTemplates");

// Aliases para mayor claridad
const sendTemplateMessage = enviarPlantillaWhatsApp;
const sendTextMessage = enviarMensajeTexto;

async function enviarPlantillaDesdeAPI({ from, url, templateName }) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    const items = data.menu || data.ofertas || [];
    const textos = Array.isArray(items)
      ? items.map((i) => i.descripcion).filter(Boolean)
      : [];
    const textoFinal = textos.join("\n");

    const logsDir = path.join(__dirname, "logs");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const logEntry =
      new Date().toISOString() +
      " - Respuesta API " +
      templateName +
      ": " +
      JSON.stringify(data) +
      "\n";
    fs.appendFileSync(path.join(logsDir, "api_log.txt"), logEntry);

    if (textoFinal) {
      await sendTemplateMessage(from, templateName, textoFinal);
    } else {
      await sendTextMessage(from, "No se pudo cargar el contenido.");
    }
  } catch (error) {
    const logsDir = path.join(__dirname, "logs");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const logEntry =
      new Date().toISOString() +
      " - Error API " +
      templateName +
      ": " +
      error.message +
      "\n";
    fs.appendFileSync(path.join(logsDir, "api_log.txt"), logEntry);
    await sendTextMessage(from, "No se pudo cargar el contenido.");
  }
}

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
      await enviarPlantillaDesdeAPI({
        url: "http://localhost:3000/api/menu_hoy",
        templateName: "menu_hoy",
        from,
      });
    } else if (btnPayload === "ver ofertas del dia") {
      await enviarPlantillaDesdeAPI({
        url: "http://localhost:3000/api/ofertas",
        templateName: "ofertas_dia",
        from,
      });
    } else if (btnPayload === "salir") {
      await sendTextMessage(from, "¡Gracias por visitarnos!");
    }
  }
}


module.exports = handleIncomingMessage;
