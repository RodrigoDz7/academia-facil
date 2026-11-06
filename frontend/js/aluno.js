if (exigirLogin('aluno')) {
  const usuario = getUsuario();
  document.querySelector('#saudacao').textContent = `Olá, ${usuario.nome} (Aluno)`;
  document.querySelector('#sair').addEventListener('click', sair);

  document.querySelector('#testar-acesso').addEventListener('click', async () => {
    const resposta = await fetch(`${API}/usuarios`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const resultado = await resposta.json();
    const mensagem = document.querySelector('#resultado-acesso');
    mensagem.textContent = `${resposta.status}: ${resultado.mensagem}`;
    mensagem.className = 'mensagem erro';
  });
}
