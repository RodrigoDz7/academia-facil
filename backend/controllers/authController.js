const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

async function login(req, res, next) {
  const { email, senha } = req.body;
  if (typeof email !== 'string' || typeof senha !== 'string') {
    return res.status(401).json({ mensagem: 'E-mail ou senha incorretos' });
  }

  try {
    const [usuarios] = await pool.execute(
      'SELECT id, nome, email, senha, nivel FROM usuarios WHERE email = ?',
      [email.trim().toLowerCase()],
    );
    const usuario = usuarios[0];
    const senhaCorreta = usuario && await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos' });
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('preencha_')) {
      return next(new Error('JWT_SECRET não foi configurado'));
    }

    const token = jwt.sign(
      { id: usuario.id, nivel: usuario.nivel },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '2h' },
    );
    return res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, nivel: usuario.nivel },
    });
  } catch (erro) {
    return next(erro);
  }
}

async function perfil(req, res, next) {
  try {
    const [usuarios] = await pool.execute(
      'SELECT id, nome, email, nivel, plano_id FROM usuarios WHERE id = ?',
      [req.usuario.id],
    );
    if (usuarios.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    return res.json({ usuario: usuarios[0] });
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { cadastrar, login, perfil };
