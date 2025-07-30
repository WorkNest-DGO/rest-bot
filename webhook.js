const express = require('express');
const messageHandling = require('./messageHandling');

const router = express.Router();

router.post('/', messageHandling);

module.exports = router;
