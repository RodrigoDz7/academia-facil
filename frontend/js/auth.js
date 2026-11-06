// O front e a API usam a mesma origem porque o Express serve estes arquivos.
const API = '';

function salvarSessao(token, usuario) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

function getToken() {
  return localStorage.getItem('token');
}

function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuario'));
  } catch (_erro) {
    return null;
  }
}

function sair() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login.html';
}

function irParaAreaDoPerfil(nivel) {
  const paginas = { admin: 'admin.html', instrutor: 'instrutor.html', aluno: 'aluno.html' };
  window.location.href = paginas[nivel] || 'login.html';
}

function exigirLogin(nivelEsperado) {
  const usuario = getUsuario();
  if (!getToken() || !usuario || usuario.nivel !== nivelEsperado) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}
