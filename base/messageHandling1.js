
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const {
  enviarPlantillaWhatsApp,
  enviarPlantillaWhatsApp2,
  enviarPlantillaOrdenPago,
  enviarPlantillaConsultaPredial,
  enviarPlantillaErrorGenerico,
  enviarPlantillaImagenTlaquepaque,
  enviarPlantillaPago,
} = require("./whatsappTemplates");

const municipio = "Tlaquepaque";
const apiUrlPadron = "http://198.251.77.121/api/caja/api/api/busquedas/padron";
const apiUrlLiquidacion = "http://198.251.77.121/api/caja/api/api/liquidacions/numero";
const authToken =   "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzaXN0ZW1hIiwiYXV0aCI6IkFMVEFfRU1QTEVBRE9TLERJU0NSRUNJT05BTCxMSVFVSURBQ0lPTl9NQU5VQUwsUk9MRV9BRE1JTiIsInBzdG8iOiJbXSIsIm5tIjoic2lzdGVtYSIsImFwMSI6InNpc3RlbWEiLCJhcDIiOiJzaXN0ZW1hIiwiaWRzdSI6MCwidXNlciI6MTAzNDMsImV4cCI6MTczMzcyMjUwNX0.F1JQ4v07Fq9sewN-4VT_3Q6ufGcrUjJ7wep-P080uLKLc06DDJOSPeOBELKX-cfkwBvvS3BCCD8FuSQim4A4hw";
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
    } else if (text.includes("realizar pago") || buttonReply === "btn_realizar_pago") {
      action = "calculo_prediales";
    } else if (text.includes("predial") || buttonReply === "btn_predial") {
      action = "solicitar_predial";
    } else if (text.includes("crear orden de pago") || buttonReply === "btn_crear_orden_pago") {
      action = "confirmar_pago";
    } else if (/^pago:\w+$/i.test(text)) {
      extractedValue = text.split(":")[1];
      action = "orden_pago";
    } else if (/^ver:(\w+)$/i.test(text)) {
      extractedValue = text.split(":")[1];
      action = "consulta_predial";
    } else if (/^orden:(\w+)$/i.test(text)) {
      extractedValue = text.split(":")[1];
      action = "pagos_finales";
    }

    // Procesar acción
    switch (action) {
      case "saludo":
        await enviarPlantillaWhatsApp(from, "saludo_inicial");
        break;

      case "solicitar_predial":
        await enviarPlantillaWhatsApp(from, "solicitar_clave_catastral");
        break;

      case "confirmar_pago":
        await enviarPlantillaWhatsApp2(from, "confirmar_pago", [extractedValue || "00000000000000000"]);
        break;

      case "orden_pago":
        await handleOrdenPago(from, extractedValue);
        break;

      case "consulta_predial":
        await handleConsultaPredial(from, extractedValue);
        break;

      case "pagos_finales":
        await handlePagosFinales(from, extractedValue);
        break;

      case "calculo_prediales":
        await enviarPlantillaImagenTlaquepaque(from);
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

// Función para manejar "orden_pago"
// Función para manejar "orden_pago"
async function handleOrdenPago(from, extractedValue) {
  try {
    const payload = { liquidaciones: extractedValue };

    // Solicitar la generación del reporte al API
    const response = await axios.post(
      "http://198.251.77.121/api/caja/api/api/generar-liquidacion-masivia-atlixco",
      payload,
      {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si se obtuvo el reporte en base64
    const pdfBase64 = response.data?.reporte;
    if (!pdfBase64) throw new Error("No se encontró reporte en la respuesta.");

    // Decodificar base64 y preparar el archivo
    const buffer = Buffer.from(pdfBase64, "base64");
    const timestamp = new Date().toISOString().replace(/[:\-T]/g, "").slice(0, 12); // Formato: yyyymmddhhmm
    const fileName = `${extractedValue}-${timestamp}.pdf`;

    // Determinar el entorno
    const isLocal = process.env.ENVIRONMENT === "local"; // Usa una variable de entorno para definir el entorno
    const localPath = "C:\\path\\to\\save\\pdf\\"; // Ruta local
    const serverPath = "/var/www/html/pdf/"; // Ruta en el servidor
    const savePath = isLocal ? localPath : serverPath;
    const filePath = path.join(savePath, fileName);

    // Asegurarse de que la carpeta existe
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }

    // Guardar el archivo PDF
    fs.writeFileSync(filePath, buffer);
    console.log(`Archivo guardado correctamente en: ${filePath}`);

    // Generar la URL para acceder al archivo
    const fileUrl = isLocal
      ? `http://localhost/pdf/${fileName}`
      : `https://grp-ia.com/report-whats-app/pdf/${fileName}`;

    // Enviar la plantilla con los datos generados
    await enviarPlantillaOrdenPago(from, municipio,  fileUrl);
  } catch (error) {
    console.error("Error en orden_pago:", error);
    // Guardar log del error
    fs.appendFileSync(
      "api_log.txt",
      `${new Date().toISOString()} - Error en orden_pago: ${error.message}\n`
    );

    // Notificar al usuario sobre el error
    await enviarPlantillaErrorGenerico(from, "sin_reporte_pdf");
  }
}


// Función para manejar "consulta_predial"
async function handleConsultaPredial(from, extractedValue) {
  const payload = { padron: "vw_padron_catastral_2", llave: "cve_catastral", valorLlave: extractedValue };

  try {
    const response = await axios.post(apiUrlPadron, payload, {
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
    });

    const resultado = response.data?.[0];
    if (!resultado) throw new Error("Sin resultados en la consulta.");

    const parameters = [
      extractedValue,
      resultado.ultimo_periodo_pagado || "Sin información",
      resultado.nombre_ne || "Sin información",
      resultado.direccion_ne || "Sin información",
      resultado.localidad_ne || "Sin información",
    ];
    await enviarPlantillaConsultaPredial(from, parameters);
  } catch (error) {
    console.error("Error en consulta_predial:", error);
    await enviarPlantillaErrorGenerico(from, "sin_resultados");
  }
}

// Función para manejar "pagos_finales"
async function handlePagosFinales(from, extractedValue) {
  try {
    const response = await axios.get(`${apiUrlLiquidacion}/${extractedValue}`, {
      headers: { Authorization: authToken },
    });

    const liquidacion = response.data;
    const enlacePago = `https://grp-ia.com/whats/reportes/pago/${liquidacion.numeroLiquidacion}`;
    await enviarPlantillaPago(from, liquidacion.numeroLiquidacion, liquidacion.total.toFixed(2), enlacePago);
  } catch (error) {
    console.error("Error en pagos_finales:", error);
    await enviarPlantillaErrorGenerico(from, "sin_resultados");
  }
}
