const bcrypt = require('bcryptjs');
const pool = require('../database/conexao');

async function cadastrar(req, res, next) {
  const { nome, email, senha } = req.body;

  if (typeof nome !== 'string' || nome.trim().length < 2) {
    return res.status(400).json({ mensagem: 'O nome deve ter pelo menos 2 caracteres' });
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ mensagem: 'Informe um e-mail válido' });
  }
  if (typeof senha !== 'string' || senha.length < 6) {
    return res.status(400).json({ mensagem: 'A senha deve ter pelo menos 6 caracteres' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const emailNormalizado = email.trim().toLowerCase();
    // O nível é fixo no SQL para impedir que o cadastro público crie admins.
    const [resultado] = await pool.execute(
      'INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, \'aluno\')',
      [nome.trim(), emailNormalizado, senhaHash],
    );
    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso',
      usuario: { id: resultado.insertId, nome: nome.trim(), email: emailNormalizado, nivel: 'aluno' },
    });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado' });
    }
    return next(erro);
  }
}

module.exports = { cadastrar };
