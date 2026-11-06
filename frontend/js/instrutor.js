if (exigirLogin('instrutor')) {
  const usuario = getUsuario();
  document.querySelector('#saudacao').textContent = `Olá, ${usuario.nome} (Instrutor)`;
  document.querySelector('#sair').addEventListener('click', sair);
}
