require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const webhookVerification = require('./webhookVerification');
const webhook = require('./webhook');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/webhook', webhookVerification);
app.post('/webhook', webhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webhook listening on port ${PORT}`));
