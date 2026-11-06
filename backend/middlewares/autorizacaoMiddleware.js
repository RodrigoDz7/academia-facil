// Autorização responde “o que você pode fazer?” conferindo o nível permitido.
function permitir(...niveis) {
  return (req, res, next) => {
    if (!req.usuario || !niveis.includes(req.usuario.nivel)) {
      return res.status(403).json({ mensagem: 'Você não tem permissão para acessar este recurso' });
    }
    return next();
  };
}

module.exports = permitir;
