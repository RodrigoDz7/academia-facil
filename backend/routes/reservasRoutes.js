const express = require('express');
const reservasController = require('../controllers/reservasController');
const autenticacao = require('../middlewares/autenticacaoMiddleware');
const permitir = require('../middlewares/autorizacaoMiddleware');

const router = express.Router();

router.get('/minhas', autenticacao, permitir('aluno'), reservasController.minhas);
router.post('/', autenticacao, permitir('aluno'), reservasController.reservar);
router.delete('/:id', autenticacao, permitir('aluno'), reservasController.cancelar);

module.exports = router;
