const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

function configureAuxiliaryRoutes(app) {
  // Configuración de CORS
  app.use(cors({
    origin: 'http://localhost:3001',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));



}

module.exports = configureAuxiliaryRoutes;
