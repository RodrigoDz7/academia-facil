const pool = require('../database/conexao');

function validarPlano(dados) {
  const nome = typeof dados.nome === 'string' ? dados.nome.trim() : '';
  const preco = Number(dados.preco);
  const duracao = Number(dados.duracao_meses);
  if (nome.length < 2) return { erro: 'O nome do plano deve ter pelo menos 2 caracteres' };
  if (!Number.isFinite(preco) || preco < 0) return { erro: 'Informe um preço válido' };
  if (!Number.isInteger(duracao) || duracao < 1) return { erro: 'A duração deve ser um número inteiro maior que zero' };
  return { nome, preco, duracao };
}

async function listar(_req, res, next) {
  try {
    const [planos] = await pool.execute('SELECT id, nome, preco, duracao_meses FROM planos ORDER BY duracao_meses');
    return res.json({ planos });
  } catch (erro) {
    return next(erro);
  }
}

async function criar(req, res, next) {
  const plano = validarPlano(req.body);
  if (plano.erro) return res.status(400).json({ mensagem: plano.erro });
  try {
    await pool.execute(
      'INSERT INTO planos (nome, preco, duracao_meses) VALUES (?, ?, ?)',
      [plano.nome, plano.preco, plano.duracao],
    );
    return res.status(201).json({ mensagem: 'Plano criado com sucesso', id: resultado.insertId });
  } catch (erro) {
    return next(erro);
  }
}

async function atualizar(req, res, next) {
  const plano = validarPlano(req.body);
  if (plano.erro) return res.status(400).json({ mensagem: plano.erro });
  try {
    const [existentes] = await pool.execute('SELECT id FROM planos WHERE id = ?', [req.params.id]);
    if (existentes.length === 0) return res.status(404).json({ mensagem: 'Plano não encontrado' });
    const [resultado] = await pool.execute(
      'UPDATE planos SET nome = ?, preco = ?, duracao_meses = ? WHERE id = ?',
      [plano.nome, plano.preco, plano.duracao, req.params.id],
    );
    return res.json({ mensagem: 'Plano atualizado com sucesso' });
  } catch (erro) {
    return next(erro);
  }
}

async function excluir(req, res, next) {
  try {
    const [resultado] = await pool.execute('DELETE FROM planos WHERE id = ?', [req.params.id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ mensagem: 'Plano não encontrado' });
    return res.json({ mensagem: 'Plano excluído com sucesso' });
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { listar, criar, atualizar, excluir };
