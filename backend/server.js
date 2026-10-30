// Arquivo principal do back-end.
// Nesta entrega ele só sobe o servidor e responde uma mensagem de teste.
// Nas próximas entregas vamos ligar aqui as rotas (routes).

require('dotenv').config();           // lê as configurações do arquivo .env
const express = require('express');   // framework que cria a API

const app = express();
app.use(express.json());              // permite receber dados em formato JSON

// Rota de teste: confirma que a API está no ar
app.get('/', (req, res) => {
  res.json({ mensagem: 'API da Academia Fácil funcionando' });
});

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});
