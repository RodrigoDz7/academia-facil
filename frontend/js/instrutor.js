if (exigirLogin('instrutor')) {
  const usuario = getUsuario();
  const formulario = document.querySelector('#form-aula');
  const mensagemAula = document.querySelector('#mensagem-aulas');
  document.querySelector('#saudacao').textContent = `Olá, ${usuario.nome} (Instrutor)`;
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

  function dataLocalInput(valor) {
    const data = new Date(valor);
    return new Date(data.getTime() - data.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  function limparFormulario() {
    formulario.reset();
    document.querySelector('#aula-id').value = '';
    document.querySelector('#titulo-form-aula').textContent = 'Criar aula';
    document.querySelector('#cancelar-edicao').hidden = true;
  }

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(formulario));
    dados.vagas = Number(dados.vagas);
    const id = dados.id;
    delete dados.id;
    try {
      await requisicao(id ? `/aulas/${id}` : '/aulas', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      document.querySelector('#mensagem-form').textContent = id ? 'Aula atualizada.' : 'Aula criada.';
      limparFormulario();
      await carregarAulas();
    } catch (erro) {
      document.querySelector('#mensagem-form').textContent = erro.message;
    }
  });

  document.querySelector('#cancelar-edicao').addEventListener('click', limparFormulario);

  async function carregarAulas() {
    const corpo = document.querySelector('#lista-aulas');
    corpo.replaceChildren();
    try {
      const { aulas } = await requisicao('/aulas/minhas');
      if (aulas.length === 0) mensagemAula.textContent = 'Você ainda não criou aulas.';
      aulas.forEach((aula) => {
        const linha = document.createElement('tr');
        [aula.titulo, dataFormatada(aula.dia_hora), `${aula.reservas_confirmadas}/${aula.vagas}`].forEach((texto) => {
          const celula = document.createElement('td');
          celula.textContent = texto;
          linha.append(celula);
        });
        const acoes = document.createElement('td');
        const editar = document.createElement('button');
        editar.textContent = 'Editar';
        editar.addEventListener('click', () => {
          document.querySelector('#aula-id').value = aula.id;
          document.querySelector('#titulo').value = aula.titulo;
          document.querySelector('#descricao').value = aula.descricao || '';
          document.querySelector('#dia_hora').value = dataLocalInput(aula.dia_hora);
          document.querySelector('#vagas').value = aula.vagas;
          document.querySelector('#titulo-form-aula').textContent = 'Editar aula';
          document.querySelector('#cancelar-edicao').hidden = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        const excluir = document.createElement('button');
        excluir.textContent = 'Excluir';
        excluir.addEventListener('click', async () => {
          try {
            await requisicao(`/aulas/${aula.id}`, { method: 'DELETE' });
            await carregarAulas();
          } catch (erro) {
            mensagemAula.textContent = erro.message;
          }
        });
        const listarReservas = document.createElement('button');
        listarReservas.textContent = 'Ver reservas';
        listarReservas.addEventListener('click', () => carregarReservas(aula.id));
        acoes.append(editar, excluir, listarReservas);
        linha.append(acoes);
        corpo.append(linha);
      });
    } catch (erro) {
      mensagemAula.textContent = erro.message;
    }
  }

  async function carregarReservas(aulaId) {
    const corpo = document.querySelector('#lista-reservas');
    const mensagem = document.querySelector('#mensagem-reservas');
    corpo.replaceChildren();
    try {
      const { reservas } = await requisicao(`/aulas/${aulaId}/reservas`);
      mensagem.textContent = reservas.length ? `${reservas.length} reserva(s).` : 'Esta aula ainda não tem reservas.';
      reservas.forEach((reserva) => {
        const linha = document.createElement('tr');
        [reserva.nome, reserva.email, dataFormatada(reserva.data_reserva)].forEach((texto) => {
          const celula = document.createElement('td');
          celula.textContent = texto;
          linha.append(celula);
        });
        corpo.append(linha);
      });
    } catch (erro) {
      mensagem.textContent = erro.message;
    }
  }

  carregarAulas();
}
