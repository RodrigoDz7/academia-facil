const express = require('express');
const aulasController = require('../controllers/aulasController');
const autenticacao = require('../middlewares/autenticacaoMiddleware');
const permitir = require('../middlewares/autorizacaoMiddleware');

const router = express.Router();

router.get('/', autenticacao, aulasController.listar);
router.get('/minhas', autenticacao, permitir('admin', 'instrutor'), aulasController.listarMinhas);
router.get('/:id/reservas', autenticacao, permitir('admin', 'instrutor'), aulasController.listarReservas);
router.post('/', autenticacao, permitir('admin', 'instrutor'), aulasController.criar);
router.put('/:id', autenticacao, permitir('admin', 'instrutor'), aulasController.atualizar);
router.delete('/:id', autenticacao, permitir('admin', 'instrutor'), aulasController.excluir);

module.exports = router;
