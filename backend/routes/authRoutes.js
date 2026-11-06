const express = require('express');
const authController = require('../controllers/authController');
const autenticacao = require('../middlewares/autenticacaoMiddleware');

const router = express.Router();

router.post('/cadastro', authController.cadastrar);
router.post('/login', authController.login);
router.get('/perfil', autenticacao, authController.perfil);

module.exports = router;
