const pool = require('../database/conexao');

async function listar(_req, res, next) {
  try {
    const [usuarios] = await pool.execute(
      'SELECT id, nome, email, nivel, plano_id FROM usuarios ORDER BY id',
    );
    return res.json({ usuarios });
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { listar };
