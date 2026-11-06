if (exigirLogin('admin')) {
  const usuario = getUsuario();
  document.querySelector('#saudacao').textContent = `Olá, ${usuario.nome} (Admin)`;
  document.querySelector('#sair').addEventListener('click', sair);

  async function carregarUsuarios() {
    const mensagem = document.querySelector('#mensagem-usuarios');
    try {
      const resposta = await fetch(`${API}/usuarios`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const resultado = await resposta.json();
      if (!resposta.ok) throw new Error(resultado.mensagem || 'Não foi possível carregar os usuários.');

      const corpoTabela = document.querySelector('#lista-usuarios');
      resultado.usuarios.forEach((item) => {
        const linha = document.createElement('tr');
        [item.nome, item.email, item.nivel].forEach((valor) => {
          const celula = document.createElement('td');
          celula.textContent = valor;
          linha.append(celula);
        });
        corpoTabela.append(linha);
      });
    } catch (erro) {
      mensagem.textContent = erro.message;
      mensagem.className = 'mensagem erro';
    }
  }

  carregarUsuarios();
}
