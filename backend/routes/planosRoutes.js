const express = require('express');
const planosController = require('../controllers/planosController');
const autenticacao = require('../middlewares/autenticacaoMiddleware');
const permitir = require('../middlewares/autorizacaoMiddleware');

const router = express.Router();

router.get('/', autenticacao, planosController.listar);
router.post('/', autenticacao, permitir('admin'), planosController.criar);
router.put('/:id', autenticacao, permitir('admin'), planosController.atualizar);
router.delete('/:id', autenticacao, permitir('admin'), planosController.excluir);

module.exports = router;
