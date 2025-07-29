const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

function configureAuxiliaryRoutes(app) {
  // Configuración de CORS
  app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Ruta para obtener datos de la API externa y mostrar el frontend
  const apiBaseUrl = "http://198.251.77.121/api/caja/api/api/liquidacions/numero/";
  const authToken = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzaXN0ZW1hIiwiYXV0aCI6IkFMVEFfRU1QTEVBRE9TLERJU0NSRUNJT05BTCxMSVFVSURBQ0lPTl9NQU5VQUwsUk9MRV9BRE1JTiIsInBzdG8iOiJbXSIsIm5tIjoic2lzdGVtYSIsImFwMSI6InNpc3RlbWEiLCJhcDIiOiJzaXN0ZW1hIiwiaWRzdSI6MCwidXNlciI6MTAzNDMsImV4cCI6MTczMzcyMjUwNX0.F1JQ4v07Fq9sewN-4VT_3Q6ufGcrUjJ7wep-P080uLKLc06DDJOSPeOBELKX-cfkwBvvS3BCCD8FuSQim4A4hw";
  
  app.get('/pago/:number', async (req, res) => {
    const { number } = req.params;
    const apiUrl = `${apiBaseUrl}${number}`;

    try {
      const response = await axios.get(apiUrl, { headers: { Authorization: authToken } });

      const {
        catTipoLiquidacionDescripcion,
        concepto,
        contribuyente,
        total,
        totalLetra,
      } = response.data;

      const htmlFilePath = path.join(__dirname, 'index.html');
      let html = await fs.promises.readFile(htmlFilePath, 'utf8');

      html = html
        .replace(/{{catTipoLiquidacionDescripcion}}/g, catTipoLiquidacionDescripcion || 'Tipo de pago no disponible')
        .replace(/{{concepto}}/g, concepto || 'Concepto no disponible')
        .replace(/{{contribuyente}}/g, contribuyente || 'Contribuyente no disponible')
        .replace(/{{total}}/g, `$${total.toLocaleString('es-MX')}` || '$0')
        .replace(/{{totalLetra}}/g, totalLetra || 'Total en letra no disponible');

      res.send(html);
    } catch (error) {
      console.error('Error al obtener datos de la API:', error.message);
      res.status(500).send('<h1>Error al obtener datos de la API</h1>');
    }
  });
}

module.exports = configureAuxiliaryRoutes;
