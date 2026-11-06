const jwt = require('jsonwebtoken');

function autenticacao(req, res, next) {
  const cabecalho = req.headers.authorization;
  const token = cabecalho && cabecalho.startsWith('Bearer ')
    ? cabecalho.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ mensagem: 'Token de autenticação não informado' });
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: dados.id, nivel: dados.nivel };
    return next();
  } catch (_erro) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
  }
}

module.exports = autenticacao;
