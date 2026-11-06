const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/', (_req, res) => res.redirect('/login.html'));
app.get('/status', (_req, res) => res.json({ mensagem: 'API da Academia Fácil funcionando' }));
app.use('/auth', authRoutes);
app.use('/usuarios', usuariosRoutes);

app.use((_req, res) => res.status(404).json({ mensagem: 'Rota não encontrada' }));
app.use((erro, _req, res, _next) => {
  console.error('Erro interno na API:', erro.message);
  return res.status(500).json({ mensagem: 'Erro interno do servidor' });
});

const PORTA = process.env.PORT || 3000;
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('preencha_')) {
  console.warn('Atenção: configure JWT_SECRET no arquivo backend/.env antes de usar o login.');
}

app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));
