const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/cadastro', authController.cadastrar);

module.exports = router;
