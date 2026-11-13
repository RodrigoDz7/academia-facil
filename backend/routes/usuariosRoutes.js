const express = require('express');
const usuariosController = require('../controllers/usuariosController');
const autenticacao = require('../middlewares/autenticacaoMiddleware');
const permitir = require('../middlewares/autorizacaoMiddleware');

const router = express.Router();

router.get('/', autenticacao, permitir('admin'), usuariosController.listar);
router.patch('/:id/plano', autenticacao, permitir('admin'), usuariosController.atribuirPlano);

module.exports = router;
