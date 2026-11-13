const pool = require('../database/conexao');

async function minhas(req, res, next) {
  try {
    const [reservas] = await pool.execute(
      `SELECT r.id AS reserva_id, r.data_reserva, a.id AS aula_id, a.titulo,
        a.dia_hora, a.vagas, u.nome AS instrutor
       FROM reservas r
       JOIN aulas a ON a.id = r.aula_id
       JOIN usuarios u ON u.id = a.instrutor_id
       WHERE r.aluno_id = ? ORDER BY a.dia_hora DESC`,
      [req.usuario.id],
    );
    return res.json({ reservas });
  } catch (erro) {
    return next(erro);
  }
}

async function reservar(req, res, next) {
  const aulaId = Number(req.body.aula_id);
  if (!Number.isInteger(aulaId) || aulaId < 1) {
    return res.status(400).json({ mensagem: 'Informe uma aula válida' });
  }

  let conexao;
  try {
    conexao = await pool.getConnection();
    await conexao.beginTransaction();

    const [usuarios] = await conexao.execute(
      'SELECT id FROM usuarios WHERE id = ? AND nivel = \'aluno\' AND plano_id IS NOT NULL AND plano_expira_em >= CURDATE()',
      [req.usuario.id],
    );
    if (usuarios.length === 0) {
      await conexao.rollback();
      return res.status(403).json({ mensagem: 'É necessário ter um plano ativo para reservar aulas' });
    }

    const [aulas] = await conexao.execute(
      'SELECT id, vagas, dia_hora > NOW() AS futura FROM aulas WHERE id = ? FOR UPDATE',
      [aulaId],
    );
    if (aulas.length === 0) {
      await conexao.rollback();
      return res.status(404).json({ mensagem: 'Aula não encontrada' });
    }
    if (!aulas[0].futura) {
      await conexao.rollback();
      return res.status(409).json({ mensagem: 'Não é possível reservar uma aula que já começou' });
    }

    const [existentes] = await conexao.execute(
      'SELECT id FROM reservas WHERE aluno_id = ? AND aula_id = ?',
      [req.usuario.id, aulaId],
    );
    if (existentes.length > 0) {
      await conexao.rollback();
      return res.status(409).json({ mensagem: 'Você já reservou esta aula' });
    }

    const [reservasAula] = await conexao.execute(
      'SELECT id FROM reservas WHERE aula_id = ? FOR UPDATE',
      [aulaId],
    );
    if (reservasAula.length >= aulas[0].vagas) {
      await conexao.rollback();
      return res.status(409).json({ mensagem: 'Não há vagas disponíveis nesta aula' });
    }

    const [resultado] = await conexao.execute(
      'INSERT INTO reservas (aluno_id, aula_id) VALUES (?, ?)',
      [req.usuario.id, aulaId],
    );
    await conexao.commit();
    return res.status(201).json({ mensagem: 'Aula reservada com sucesso', id: resultado.insertId });
  } catch (erro) {
    if (conexao) await conexao.rollback();
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Você já reservou esta aula' });
    }
    return next(erro);
  } finally {
    if (conexao) conexao.release();
  }
}

async function cancelar(req, res, next) {
  try {
    const [resultado] = await pool.execute(
      'DELETE FROM reservas WHERE id = ? AND aluno_id = ?',
      [req.params.id, req.usuario.id],
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Reserva não encontrada' });
    }
    return res.json({ mensagem: 'Reserva cancelada com sucesso' });
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { minhas, reservar, cancelar };
