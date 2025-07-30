const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const webhookRouter = require('./webhook'); // conexión del webhook

app.use(express.json());
app.use('/webhook', webhookRouter); // ruta base para webhook

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
