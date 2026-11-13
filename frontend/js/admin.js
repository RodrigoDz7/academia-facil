if (exigirLogin('admin')) {
  const usuarioLogado = getUsuario();
  document.querySelector('#saudacao').textContent = `Olá, ${usuarioLogado.nome} (Admin)`;
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

  function celula(linha, valor) {
    const elemento = document.createElement('td');
    elemento.textContent = valor;
    linha.append(elemento);
    return elemento;
  }

  function botao(texto, acao) {
    const elemento = document.createElement('button');
    elemento.type = 'button';
    elemento.textContent = texto;
    elemento.addEventListener('click', acao);
    return elemento;
  }

  function dataLocalInput(valor) {
    const data = new Date(valor);
    return new Date(data.getTime() - data.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  async function carregarPlanos() {
    const [resultado] = await Promise.all([requisicao('/planos')]);
    const corpo = document.querySelector('#lista-planos');
    const seletorAula = document.querySelector('#aula-instrutor');
    corpo.replaceChildren();

    resultado.planos.forEach((plano) => {
      const linha = document.createElement('tr');
      celula(linha, plano.nome);
      celula(linha, `R$ ${Number(plano.preco).toFixed(2)}`);
      celula(linha, `${plano.duracao_meses} mês(es)`);
      const acoes = document.createElement('td');
      acoes.append(
        botao('Editar', () => {
          document.querySelector('#plano-id').value = plano.id;
          document.querySelector('#plano-nome').value = plano.nome;
          document.querySelector('#plano-preco').value = plano.preco;
          document.querySelector('#plano-duracao').value = plano.duracao_meses;
          document.querySelector('#cancelar-plano').hidden = false;
        }),
        botao('Excluir', async () => {
          try {
            await requisicao(`/planos/${plano.id}`, { method: 'DELETE' });
            await carregarPlanos();
            await carregarUsuarios();
          } catch (erro) {
            document.querySelector('#mensagem-planos').textContent = erro.message;
          }
        }),
      );
      linha.append(acoes);
      corpo.append(linha);
    });

    const atual = seletorAula.value;
    const { usuarios } = await requisicao('/usuarios');
    seletorAula.replaceChildren();
    usuarios.filter((item) => item.nivel === 'instrutor').forEach((item) => {
      const opcao = document.createElement('option');
      opcao.value = item.id;
      opcao.textContent = item.nome;
      seletorAula.append(opcao);
    });
    if (usuarios.filter((item) => item.nivel === 'instrutor').some((item) => String(item.id) === atual)) {
      seletorAula.value = atual;
    }
    await carregarUsuarios(resultado.planos);
  }

  async function carregarUsuarios(planos) {
    const corpo = document.querySelector('#lista-usuarios');
    corpo.replaceChildren();
    try {
      const dadosPlanos = planos ? { planos } : await requisicao('/planos');
      const { usuarios } = await requisicao('/usuarios');
      usuarios.forEach((item) => {
        const linha = document.createElement('tr');
        celula(linha, item.nome);
        celula(linha, item.email);
        celula(linha, item.nivel);
        const planoCelula = document.createElement('td');
        if (item.nivel === 'aluno') {
          const seletor = document.createElement('select');
          const semPlano = document.createElement('option');
          semPlano.value = '';
          semPlano.textContent = 'Sem plano';
          seletor.append(semPlano);
          dadosPlanos.planos.forEach((plano) => {
            const opcao = document.createElement('option');
            opcao.value = plano.id;
            opcao.textContent = plano.nome;
            seletor.append(opcao);
          });
          seletor.value = item.plano_id || '';
          const validade = item.plano_expira_em
            ? ` (até ${String(item.plano_expira_em).slice(0, 10).split('-').reverse().join('/')})`
            : '';
          planoCelula.append(seletor, document.createTextNode(validade), document.createElement('br'));
          planoCelula.append(botao('Salvar plano', async () => {
            try {
              await requisicao(`/usuarios/${item.id}/plano`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plano_id: seletor.value ? Number(seletor.value) : null }),
              });
              document.querySelector('#mensagem-usuarios').textContent = `Plano atualizado para ${item.nome}.`;
              await carregarUsuarios(dadosPlanos.planos);
            } catch (erro) {
              document.querySelector('#mensagem-usuarios').textContent = erro.message;
            }
          }));
        } else {
          planoCelula.textContent = '—';
        }
        linha.append(planoCelula);
        corpo.append(linha);
      });
    } catch (erro) {
      document.querySelector('#mensagem-usuarios').textContent = erro.message;
    }
  }

  document.querySelector('#form-plano').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const id = document.querySelector('#plano-id').value;
    const dados = {
      nome: document.querySelector('#plano-nome').value,
      preco: Number(document.querySelector('#plano-preco').value),
      duracao_meses: Number(document.querySelector('#plano-duracao').value),
    };
    try {
      await requisicao(id ? `/planos/${id}` : '/planos', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      evento.target.reset();
      document.querySelector('#plano-id').value = '';
      document.querySelector('#cancelar-plano').hidden = true;
      document.querySelector('#mensagem-planos').textContent = 'Plano salvo.';
      await carregarPlanos();
    } catch (erro) {
      document.querySelector('#mensagem-planos').textContent = erro.message;
    }
  });

  document.querySelector('#cancelar-plano').addEventListener('click', () => {
    document.querySelector('#form-plano').reset();
    document.querySelector('#plano-id').value = '';
    document.querySelector('#cancelar-plano').hidden = true;
  });

  document.querySelector('#form-aula').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const id = document.querySelector('#aula-id').value;
    const dados = {
      titulo: document.querySelector('#aula-titulo').value,
      descricao: document.querySelector('#aula-descricao').value,
      dia_hora: document.querySelector('#aula-data').value,
      vagas: Number(document.querySelector('#aula-vagas').value),
      instrutor_id: Number(document.querySelector('#aula-instrutor').value),
    };
    try {
      await requisicao(id ? `/aulas/${id}` : '/aulas', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      evento.target.reset();
      document.querySelector('#aula-id').value = '';
      document.querySelector('#cancelar-aula').hidden = true;
      document.querySelector('#mensagem-aulas').textContent = 'Aula salva.';
      await carregarAulas();
    } catch (erro) {
      document.querySelector('#mensagem-aulas').textContent = erro.message;
    }
  });

  document.querySelector('#cancelar-aula').addEventListener('click', () => {
    document.querySelector('#form-aula').reset();
    document.querySelector('#aula-id').value = '';
    document.querySelector('#cancelar-aula').hidden = true;
  });

  async function carregarAulas() {
    const corpo = document.querySelector('#lista-aulas');
    corpo.replaceChildren();
    try {
      const { aulas } = await requisicao('/aulas/minhas');
      aulas.forEach((aula) => {
        const linha = document.createElement('tr');
        celula(linha, aula.titulo);
        celula(linha, aula.instrutor);
        celula(linha, new Date(aula.dia_hora).toLocaleString('pt-BR'));
        celula(linha, `${aula.reservas_confirmadas}/${aula.vagas}`);
        const acoes = document.createElement('td');
        acoes.append(
          botao('Editar', () => {
            document.querySelector('#aula-id').value = aula.id;
            document.querySelector('#aula-titulo').value = aula.titulo;
            document.querySelector('#aula-descricao').value = aula.descricao || '';
            document.querySelector('#aula-data').value = dataLocalInput(aula.dia_hora);
            document.querySelector('#aula-vagas').value = aula.vagas;
            document.querySelector('#aula-instrutor').value = aula.instrutor_id;
            document.querySelector('#cancelar-aula').hidden = false;
          }),
          botao('Excluir', async () => {
            try {
              await requisicao(`/aulas/${aula.id}`, { method: 'DELETE' });
              await carregarAulas();
            } catch (erro) {
              document.querySelector('#mensagem-aulas').textContent = erro.message;
            }
          }),
          botao('Ver reservas', () => carregarReservas(aula.id)),
        );
        linha.append(acoes);
        corpo.append(linha);
      });
    } catch (erro) {
      document.querySelector('#mensagem-aulas').textContent = erro.message;
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
        celula(linha, reserva.nome);
        celula(linha, reserva.email);
        celula(linha, new Date(reserva.data_reserva).toLocaleString('pt-BR'));
        corpo.append(linha);
      });
    } catch (erro) {
      mensagem.textContent = erro.message;
    }
  }

  carregarPlanos().then(carregarAulas).catch((erro) => {
    document.querySelector('#mensagem-planos').textContent = erro.message;
  });
}
