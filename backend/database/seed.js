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
    const [planos] = await pool.execute('SELECT duracao_meses FROM planos WHERE id = ?', [1]);
    if (planos.length > 0) {
      await pool.execute(
        'UPDATE usuarios SET plano_id = 1, plano_expira_em = DATE_ADD(CURDATE(), INTERVAL ? MONTH) WHERE email = ? AND plano_expira_em IS NULL',
        [planos[0].duracao_meses, 'aluno@academia.com'],
      );
    }
    console.log('Seed concluído. Usuários de teste criados ou já existentes.');
  } catch (erro) {
    console.error('Erro ao criar usuários de teste:', erro.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

executarSeed();
