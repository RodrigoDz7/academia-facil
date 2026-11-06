const bcrypt = require('bcryptjs');
const pool = require('./conexao');

async function criarUsuario({ nome, email, nivel, planoId = null }) {
  const [existentes] = await pool.execute(
    'SELECT id FROM usuarios WHERE email = ?',
    [email],
  );

  if (existentes.length > 0) return;

  const senha = await bcrypt.hash('123456', 10);
  await pool.execute(
    'INSERT INTO usuarios (nome, email, senha, nivel, plano_id) VALUES (?, ?, ?, ?, ?)',
    [nome, email, senha, nivel, planoId],
  );
}

async function executarSeed() {
  try {
    await criarUsuario({ nome: 'Administrador', email: 'admin@academia.com', nivel: 'admin' });
    await criarUsuario({ nome: 'Instrutor', email: 'instrutor@academia.com', nivel: 'instrutor' });
    await criarUsuario({ nome: 'Aluno', email: 'aluno@academia.com', nivel: 'aluno', planoId: 1 });
    console.log('Seed concluído. Usuários de teste criados ou já existentes.');
  } catch (erro) {
    console.error('Erro ao criar usuários de teste:', erro.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

executarSeed();
