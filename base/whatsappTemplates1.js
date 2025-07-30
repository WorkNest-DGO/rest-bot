const axios = require("axios");
const fs = require("fs");

// Token de acceso generado en la consola de Meta
const accessToken = "EAALCD9w1tyQBPNcZBxgrxbvJbn3qxyojxs55Mgu3z0Qlh3JzcHoOBLxED2vZCKiPqJefkZA1rDYEdlsIZBAynwMnLoq65yB1Y6EPkZB7BZAZCMtnqfewEGPZAkRsOb5y6AawvxAUIF4S3bH8wfsfgm4PBzMwIA3Ka2omjlomNLUAlVAbZBW2rmbnR0SSp9OzNCp7q7AZDZD";
const phoneNumberId = "671642199369915";

// Función para limpiar y validar el número
function procesarNumero(to) {
  if (!to) throw new Error("Número de destinatario no válido");
  return to.startsWith("521") ? to.replace(/^521/, "52") : to;
}

  if (!token) {
    console.warn('⚠️  WHATSAPP_TOKEN no definido');
    fs.appendFileSync('api_log.txt', '⚠️  WHATSAPP_TOKEN no definido\n');
    return;
  }

  if (!phoneId) {
    console.warn('⚠️  phoneId no definido');
    fs.appendFileSync('api_log.txt', '⚠️  phoneId no definido\n');
    return;
  }

  if (!to) {
    console.warn('⚠️  to no definido');
    fs.appendFileSync('api_log.txt', '⚠️  to no definido\n');
    return;
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

async function enviarPlantillaWhatsApp2(to, templateName, templateParameters = []) {
  const components = templateParameters.length
    ? [
        {
          type: "body",
          parameters: templateParameters.map((text) => ({ type: "text", text })),
        },
      ]
    : [];
  await enviarPayload(to, templateName, components);
}

async function enviarPlantillaOrdenPago(to, orden, reference) {
  const components = [
    {
      type: "body",
      parameters: [
        { type: "text", text: `${orden}` },
        { type: "text", text: reference },
      ],
    },
  ];
  await enviarPayload(to, "order", components);
}

async function enviarPlantillaConsultaPredial(to, parameters) {
  const components = [
    {
      type: "body",
      parameters: parameters.map((text) => ({ type: "text", text })),
    },
  ];
  await enviarPayload(to, "datos_consulta_predial", components);
}

async function enviarPlantillaErrorGenerico(to, errorMessage) {
  const components = [
    {
      type: "body",
      parameters: [{ type: "text", text: errorMessage }],
    },
  ];
  await enviarPayload(to, "error_generico", components);
}

async function enviarPlantillaImagenTlaquepaque(to) {
  const components = [
    {
      type: "header",
      parameters: [
        {
          type: "image",
          image: {
            link: "https://grp-ia.com/report-whats-app/pdf/tlaquepaque.jpg",
          },
        },
      ],
    },
  ];
  await enviarPayload(to, "calculo", components);
}

async function enviarPlantillaPago(to, orden, amount, reference) {
  const components = [
    {
      type: "body",
      parameters: [
        { type: "text", text: `${orden}` },
        { type: "text", text: `$${amount}` },
        { type: "text", text: reference },
      ],
    },
  ];
  await enviarPayload(to, "pagof", components);
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
  enviarPlantillaWhatsApp,
  enviarPlantillaWhatsApp2,
  enviarPlantillaOrdenPago,
  enviarPlantillaConsultaPredial,
  enviarPlantillaErrorGenerico,
  enviarPlantillaImagenTlaquepaque,
  enviarPlantillaPago,
};
