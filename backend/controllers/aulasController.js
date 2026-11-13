const pool = require('../database/conexao');

function validarAula(dados) {
  const titulo = typeof dados.titulo === 'string' ? dados.titulo.trim() : '';
  const diaHora = typeof dados.dia_hora === 'string' ? dados.dia_hora.trim().replace('T', ' ') : '';
  const vagas = Number(dados.vagas);
  if (titulo.length < 2) return { erro: 'O título deve ter pelo menos 2 caracteres' };
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(diaHora) || Number.isNaN(Date.parse(diaHora))) {
    return { erro: 'Informe uma data e hora válidas' };
  }
  if (Date.parse(diaHora) <= Date.now()) return { erro: 'A aula deve ter uma data futura' };
  if (!Number.isInteger(vagas) || vagas < 1) return { erro: 'As vagas devem ser um número inteiro maior que zero' };
  return { titulo, diaHora, vagas, descricao: typeof dados.descricao === 'string' ? dados.descricao.trim() : '' };
}

async function conferirInstrutor(id) {
  const [usuarios] = await pool.execute(
    'SELECT id FROM usuarios WHERE id = ? AND nivel = \'instrutor\'',
    [id],
  );
  return usuarios.length > 0;
}

async function listar(_req, res, next) {
  try {
    const [aulas] = await pool.execute(
      `SELECT a.id, a.titulo, a.descricao, a.dia_hora, a.vagas, a.instrutor_id,
        u.nome AS instrutor,
        (SELECT COUNT(*) FROM reservas r WHERE r.aula_id = a.id) AS reservas_confirmadas,
        a.vagas - (SELECT COUNT(*) FROM reservas r WHERE r.aula_id = a.id) AS vagas_disponiveis
       FROM aulas a JOIN usuarios u ON u.id = a.instrutor_id
       WHERE a.dia_hora >= NOW() ORDER BY a.dia_hora`,
    );
    return res.json({ aulas });
  } catch (erro) {
    return next(erro);
  }
}

async function listarMinhas(req, res, next) {
  try {
    const condicao = req.usuario.nivel === 'admin' ? '' : 'WHERE a.instrutor_id = ?';
    const parametros = req.usuario.nivel === 'admin' ? [] : [req.usuario.id];
    const [aulas] = await pool.execute(
      `SELECT a.id, a.titulo, a.descricao, a.dia_hora, a.vagas, a.instrutor_id,
        u.nome AS instrutor,
        (SELECT COUNT(*) FROM reservas r WHERE r.aula_id = a.id) AS reservas_confirmadas,
        a.vagas - (SELECT COUNT(*) FROM reservas r WHERE r.aula_id = a.id) AS vagas_disponiveis
       FROM aulas a JOIN usuarios u ON u.id = a.instrutor_id
       ${condicao} ORDER BY a.dia_hora`,
      parametros,
    );
    return res.json({ aulas });
  } catch (erro) {
    return next(erro);
  }
}

async function criar(req, res, next) {
  const aula = validarAula(req.body);
  if (aula.erro) return res.status(400).json({ mensagem: aula.erro });

  try {
    const instrutorId = req.usuario.nivel === 'instrutor' ? req.usuario.id : Number(req.body.instrutor_id);
    if (!Number.isInteger(instrutorId) || !(await conferirInstrutor(instrutorId))) {
      return res.status(400).json({ mensagem: 'Selecione um instrutor válido' });
    }
    const [resultado] = await pool.execute(
      'INSERT INTO aulas (titulo, descricao, dia_hora, vagas, instrutor_id) VALUES (?, ?, ?, ?, ?)',
      [aula.titulo, aula.descricao, aula.diaHora, aula.vagas, instrutorId],
    );
    return res.status(201).json({ mensagem: 'Aula criada com sucesso', id: resultado.insertId });
  } catch (erro) {
    return next(erro);
  }
}

async function atualizar(req, res, next) {
  const aula = validarAula(req.body);
  if (aula.erro) return res.status(400).json({ mensagem: aula.erro });

  let conexao;
  try {
    conexao = await pool.getConnection();
    await conexao.beginTransaction();
    const [existentes] = await conexao.execute('SELECT instrutor_id FROM aulas WHERE id = ? FOR UPDATE', [req.params.id]);
    if (existentes.length === 0) {
      await conexao.rollback();
      return res.status(404).json({ mensagem: 'Aula não encontrada' });
    }
    if (req.usuario.nivel === 'instrutor' && existentes[0].instrutor_id !== req.usuario.id) {
      await conexao.rollback();
      return res.status(403).json({ mensagem: 'Você só pode alterar suas próprias aulas' });
    }
    const [reservas] = await conexao.execute('SELECT id FROM reservas WHERE aula_id = ? FOR UPDATE', [req.params.id]);
    if (aula.vagas < reservas.length) {
      await conexao.rollback();
      return res.status(409).json({ mensagem: 'As vagas não podem ficar abaixo das reservas já feitas' });
    }
    let instrutorId = existentes[0].instrutor_id;
    if (req.usuario.nivel === 'admin' && req.body.instrutor_id !== undefined) {
      instrutorId = Number(req.body.instrutor_id);
      if (!Number.isInteger(instrutorId) || !(await conferirInstrutor(instrutorId))) {
        await conexao.rollback();
        return res.status(400).json({ mensagem: 'Selecione um instrutor válido' });
      }
    }
    await conexao.execute(
      'UPDATE aulas SET titulo = ?, descricao = ?, dia_hora = ?, vagas = ?, instrutor_id = ? WHERE id = ?',
      [aula.titulo, aula.descricao, aula.diaHora, aula.vagas, instrutorId, req.params.id],
    );
    await conexao.commit();
    return res.json({ mensagem: 'Aula atualizada com sucesso' });
  } catch (erro) {
    if (conexao) await conexao.rollback();
    return next(erro);
  } finally {
    if (conexao) conexao.release();
  }
}

async function excluir(req, res, next) {
  try {
    const [aulas] = await pool.execute('SELECT instrutor_id FROM aulas WHERE id = ?', [req.params.id]);
    if (aulas.length === 0) return res.status(404).json({ mensagem: 'Aula não encontrada' });
    if (req.usuario.nivel === 'instrutor' && aulas[0].instrutor_id !== req.usuario.id) {
      return res.status(403).json({ mensagem: 'Você só pode excluir suas próprias aulas' });
    }
    await pool.execute('DELETE FROM aulas WHERE id = ?', [req.params.id]);
    return res.json({ mensagem: 'Aula excluída com sucesso' });
  } catch (erro) {
    return next(erro);
  }
}

async function listarReservas(req, res, next) {
  try {
    const [aulas] = await pool.execute('SELECT instrutor_id FROM aulas WHERE id = ?', [req.params.id]);
    if (aulas.length === 0) return res.status(404).json({ mensagem: 'Aula não encontrada' });
    if (req.usuario.nivel === 'instrutor' && aulas[0].instrutor_id !== req.usuario.id) {
      return res.status(403).json({ mensagem: 'Você só pode consultar reservas das suas aulas' });
    }
    const [reservas] = await pool.execute(
      `SELECT r.id, r.data_reserva, u.id AS aluno_id, u.nome, u.email
       FROM reservas r JOIN usuarios u ON u.id = r.aluno_id
       WHERE r.aula_id = ? ORDER BY r.data_reserva`,
      [req.params.id],
    );
    return res.json({ reservas });
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { listar, listarMinhas, criar, atualizar, excluir, listarReservas };
