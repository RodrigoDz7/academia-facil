const formularioCadastro = document.querySelector('#form-cadastro');
const mensagemCadastro = document.querySelector('#mensagem');

formularioCadastro.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(formularioCadastro));

  try {
    const resposta = await fetch(`${API}/auth/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.mensagem || 'Não foi possível cadastrar.');
    mensagemCadastro.textContent = 'Cadastro realizado! Indo para o login...';
    mensagemCadastro.className = 'mensagem sucesso';
    setTimeout(() => { window.location.href = '/login.html'; }, 1200);
  } catch (erro) {
    mensagemCadastro.textContent = erro.message;
    mensagemCadastro.className = 'mensagem erro';
  }
});
