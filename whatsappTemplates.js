const axios = require("axios");
const fs = require("fs");

const templates = {
  MENU_INICIO: "menu_inicio",
  MENU_HOY: "menu_hoy",
  CALCULO: "calculo",
  ERROR_GENERICO: "error_generico",
};

// Token de acceso generado en la consola de Meta

const accessToken = "EAALCD9w1tyQBPNcZBxgrxbvJbn3qxyojxs55Mgu3z0Qlh3JzcHoOBLxED2vZCKiPqJefkZA1rDYEdlsIZBAynwMnLoq65yB1Y6EPkZB7BZAZCMtnqfewEGPZAkRsOb5y6AawvxAUIF4S3bH8wfsfgm4PBzMwIA3Ka2omjlomNLUAlVAbZBW2rmbnR0SSp9OzNCp7q7AZDZD";
const phoneNumberId = "671642199369915";

// Función para limpiar y validar el número
function procesarNumero(to) {
  if (!to) throw new Error("Número de destinatario no válido");
  return to.startsWith("521") ? to.replace(/^521/, "52") : to;
}
 
// Función genérica para construir y enviar payloads
async function enviarPayload(to, templateName, components = []) {
  const url = `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`;
  to = procesarNumero(to);

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: "es_MX" },
      components,
    },
  };

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, payload, { headers });
    logExitoso(payload, response.data);
  } catch (error) {
    logError(payload, error);
  }
}

// Funciones específicas
async function enviarPlantillaWhatsApp(to, templateName) {
  await enviarPayload(to, templateName);
}

async function enviarPlantillaMenu(to, menuText) {
  const components = [
    {
      type: "body",
      parameters: [{ type: "text", text: menuText }],
    },
  ];
  await enviarPayload(to, templates.MENU_HOY, components);
}

async function enviarPlantillaOferta(to, ofertasText) {
  const components = [
    {
      type: "body",
      parameters: [{ type: "text", text: ofertasText }],
    },
  ];
  await enviarPayload(to, templates.CALCULO, components);
}

async function enviarPlantillaErrorGenerico(to, errorMessage) {
  const components = [
    {
      type: "body",
      parameters: [{ type: "text", text: errorMessage }],
    },
  ];
  await enviarPayload(to, templates.ERROR_GENERICO, components);
}

async function enviarMensajeTexto(to, text) {
  const url = `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: procesarNumero(to),
    type: "text",
    text: { body: text },
  };

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, payload, { headers });
    logExitoso(payload, response.data);
  } catch (error) {
    logError(payload, error);
  }
}

// Funciones auxiliares para logging
function logExitoso(payload, responseData) {
  const logMessage = `${new Date().toISOString()} - Enviado: ${JSON.stringify(payload)}\nRespuesta: ${JSON.stringify(responseData)}\n`;
  fs.appendFileSync("template_log.txt", logMessage);
  console.log("Plantilla enviada exitosamente:", responseData);
}

function logError(payload, error) {
  const errorData = error.response?.data || error.message;
  const logMessage = `${new Date().toISOString()} - Error enviando: ${JSON.stringify(payload)}\nError: ${JSON.stringify(errorData)}\n`;
  fs.appendFileSync("template_log.txt", logMessage);
  console.error("Error enviando plantilla:", errorData);
}

module.exports = {
  templates,
  enviarPlantillaWhatsApp,
  enviarPlantillaMenu,
  enviarPlantillaOferta,
  enviarPlantillaErrorGenerico,
  enviarMensajeTexto,
};
