if (exigirLogin('aluno')) {
  const usuario = getUsuario();
  document.querySelector('#saudacao').textContent = `Olá, ${usuario.nome} (Aluno)`;
  document.querySelector('#sair').addEventListener('click', sair);

  async function requisicao(url, opcoes = {}) {
    const resposta = await fetch(`${API}${url}`, {
      ...opcoes,
      headers: { Authorization: `Bearer ${getToken()}`, ...(opcoes.headers || {}) },
    });
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.mensagem || 'Não foi possível concluir a solicitação');
    return resultado;
  }

  function dataFormatada(valor) {
    return new Date(valor).toLocaleString('pt-BR');
  }

  async function carregarPerfil() {
    const resultado = await requisicao('/auth/perfil');
    const expiracao = resultado.usuario.plano_expira_em;
    document.querySelector('#estado-plano').textContent = expiracao
      ? `Seu plano está ativo até ${expiracao.split('-').reverse().join('/')}.`
      : 'Você não tem um plano ativo. Peça ao administrador para atribuir um plano.';
  }

  async function carregarAulas() {
    const corpo = document.querySelector('#lista-aulas');
    const mensagem = document.querySelector('#mensagem-aulas');
    corpo.replaceChildren();
    try {
      const { aulas } = await requisicao('/aulas');
      if (aulas.length === 0) mensagem.textContent = 'Não há aulas disponíveis.';
      aulas.forEach((aula) => {
        const linha = document.createElement('tr');
        [aula.titulo, aula.instrutor, dataFormatada(aula.dia_hora), `${aula.vagas_disponiveis}/${aula.vagas}`].forEach((texto) => {
          const celula = document.createElement('td');
          celula.textContent = texto;
          linha.append(celula);
        });
        const acao = document.createElement('td');
        const botao = document.createElement('button');
        botao.textContent = 'Reservar';
        botao.disabled = aula.vagas_disponiveis < 1;
        botao.addEventListener('click', async () => {
          try {
            await requisicao('/reservas', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ aula_id: aula.id }),
            });
            mensagem.textContent = 'Reserva realizada com sucesso.';
            await carregarAulas();
            await carregarReservas();
          } catch (erro) {
            mensagem.textContent = erro.message;
            mensagem.className = 'mensagem erro';
          }
        });
        acao.append(botao);
        linha.append(acao);
        corpo.append(linha);
      });
    } catch (erro) {
      mensagem.textContent = erro.message;
      mensagem.className = 'mensagem erro';
    }
  }

  async function carregarReservas() {
    const corpo = document.querySelector('#lista-reservas');
    const mensagem = document.querySelector('#mensagem-reservas');
    corpo.replaceChildren();
    try {
      const { reservas } = await requisicao('/reservas/minhas');
      if (reservas.length === 0) mensagem.textContent = 'Você ainda não tem reservas.';
      reservas.forEach((reserva) => {
        const linha = document.createElement('tr');
        [reserva.titulo, reserva.instrutor, dataFormatada(reserva.dia_hora)].forEach((texto) => {
          const celula = document.createElement('td');
          celula.textContent = texto;
          linha.append(celula);
        });
        const acao = document.createElement('td');
        const botao = document.createElement('button');
        botao.textContent = 'Cancelar';
        botao.addEventListener('click', async () => {
          try {
            await requisicao(`/reservas/${reserva.reserva_id}`, { method: 'DELETE' });
            mensagem.textContent = 'Reserva cancelada.';
            await carregarReservas();
            await carregarAulas();
          } catch (erro) {
            mensagem.textContent = erro.message;
          }
        });
        acao.append(botao);
        linha.append(acao);
        corpo.append(linha);
      });
    } catch (erro) {
      mensagem.textContent = erro.message;
      mensagem.className = 'mensagem erro';
    }
  }

  carregarPerfil().catch((erro) => { document.querySelector('#estado-plano').textContent = erro.message; });
  carregarAulas();
  carregarReservas();
}
