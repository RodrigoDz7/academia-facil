const pool = require('../database/conexao');

async function listar(_req, res, next) {
  try {
    const [usuarios] = await pool.execute(
      `SELECT id, nome, email, nivel, plano_id,
        CASE WHEN plano_id IS NOT NULL THEN DATE_FORMAT(plano_expira_em, '%Y-%m-%d') ELSE NULL END AS plano_expira_em
       FROM usuarios ORDER BY id`,
    );
    return res.json({ usuarios });
  } catch (erro) {
    return next(erro);
  }
}

async function atribuirPlano(req, res, next) {
  const usuarioId = Number(req.params.id);
  if (!Number.isInteger(usuarioId) || usuarioId < 1) {
    return res.status(400).json({ mensagem: 'Informe um usuário válido' });
  }

  try {
    const [usuarios] = await pool.execute('SELECT id, nivel FROM usuarios WHERE id = ?', [usuarioId]);
    if (usuarios.length === 0) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    if (usuarios[0].nivel !== 'aluno') {
      return res.status(400).json({ mensagem: 'Só é possível atribuir planos a alunos' });
    }

    if (req.body.plano_id === null) {
      await pool.execute('UPDATE usuarios SET plano_id = NULL, plano_expira_em = NULL WHERE id = ?', [usuarioId]);
      return res.json({ mensagem: 'Plano removido do aluno' });
    }

    const planoId = Number(req.body.plano_id);
    if (!Number.isInteger(planoId) || planoId < 1) {
      return res.status(400).json({ mensagem: 'Selecione um plano válido' });
    }
    const [planos] = await pool.execute('SELECT id, duracao_meses FROM planos WHERE id = ?', [planoId]);
    if (planos.length === 0) return res.status(404).json({ mensagem: 'Plano não encontrado' });

    await pool.execute(
      'UPDATE usuarios SET plano_id = ?, plano_expira_em = DATE_ADD(CURDATE(), INTERVAL ? MONTH) WHERE id = ?',
      [planoId, planos[0].duracao_meses, usuarioId],
    );
    return res.json({ mensagem: 'Plano atribuído ao aluno com sucesso' });
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { listar, atribuirPlano };
