const formularioLogin = document.querySelector('#form-login');
const mensagemLogin = document.querySelector('#mensagem');

formularioLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(formularioLogin));

  try {
    const resposta = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.mensagem || 'Não foi possível entrar.');
    salvarSessao(resultado.token, resultado.usuario);
    irParaAreaDoPerfil(resultado.usuario.nivel);
  } catch (erro) {
    mensagemLogin.textContent = erro.message;
    mensagemLogin.className = 'mensagem erro';
  }
});
