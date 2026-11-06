# Academia Fácil

Sistema web para **agendamento de aulas e controle de alunos em academias**. Projeto da disciplina de Projeto Web, com Node.js, Express, MySQL, HTML, CSS e JavaScript.

## 1. Problema identificado

Muitas academias pequenas e médias controlam alunos, planos e horários de aulas coletivas em **papel, planilhas ou grupos de WhatsApp**.

- **Contexto:** a academia oferece aulas com número limitado de vagas (spinning, funcional, yoga etc.) e precisa saber quem vai, quem está com o plano em dia e quem dá cada aula.
- **Público afetado:** alunos, instrutores e gerentes/donos de academia.
- **Consequências:** aulas lotadas ou vazias, reservas esquecidas, falta de controle de quem está com o plano ativo e dificuldade do aluno para saber horários e vagas.
- **Justificativa:** um sistema único e organizado reduz erros e retrabalho e facilita o dia a dia de todos.

## 2. Proposta de solução

Um sistema web em que:

- o **aluno** vê as aulas disponíveis e reserva uma vaga;
- o **instrutor** gerencia as suas próprias aulas e vê quem reservou;
- o **administrador** controla usuários, planos e todas as aulas.

**Objetivos:** organizar as aulas, controlar as vagas, evitar reservas duplicadas e garantir que cada pessoa acesse apenas o que o seu perfil permite.

## 3. Funcionalidades previstas

- Cadastro e login de usuários
- Três perfis de acesso (admin, instrutor, aluno)
- CRUD de aulas (criar, listar, editar e excluir)
- Reserva e cancelamento de vagas em aulas
- Histórico de reservas do aluno
- Lista de reservas de cada aula para o instrutor
- Gerenciamento de usuários e planos pelo admin

O que está implementado nesta entrega e o que ainda está planejado aparece na seção [Status do projeto](#status-do-projeto).

## 4. Tipos de usuário e ações

| Perfil | O que pode fazer |
|---|---|
| **Admin** | Gerenciar usuários e planos; ver, criar, editar e excluir qualquer aula; ver todas as reservas |
| **Instrutor** | Criar, editar e excluir **somente as próprias aulas**; ver quem reservou nelas |
| **Aluno** | Ver aulas; reservar e cancelar **as próprias** reservas; ver o próprio histórico |

Na Entrega 2, os perfis já são gravados no banco e usados pelo middleware de autorização. As operações de aulas, reservas e planos continuam planejadas para a Entrega 3.

## 5. Fluxo básico do sistema

1. A pessoa se cadastra (por padrão, como aluno) ou faz login.
2. A API confere os dados e devolve um token de acesso (JWT).
3. O sistema leva a pessoa para a tela do seu perfil (aluno, instrutor ou admin).
4. Cada ação na tela (ex.: reservar uma aula) é enviada à API; a API confere o token e a permissão, aplica as regras e grava no banco.
5. O resultado volta em JSON e a tela é atualizada.

```text
HTML → DOM → JavaScript → Fetch → API Express → Middlewares → Controller → MySQL → JSON → DOM
```

## 6. Tecnologias previstas

- **Front-end:** HTML, CSS e JavaScript puro (DOM e Fetch)
- **Back-end:** Node.js e Express 5
- **Banco de dados:** MySQL (biblioteca `mysql2`)
- **Segurança:** JWT (`jsonwebtoken`) e senhas protegidas com `bcryptjs`
- **Outras:** `dotenv` (configurações) e `cors`

## 7. Estrutura de pastas

```text
academia-facil/
├── backend/
│   ├── server.js
│   ├── routes/              # URLs da API (aulas e reservas são da Entrega 3)
│   ├── controllers/         # regras de negócio e SQL
│   ├── middlewares/         # autenticação JWT e autorização por perfil
│   ├── database/
│   │   ├── conexao.js
│   │   └── seed.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── login.html, cadastro.html, aluno.html, instrutor.html, admin.html
│   ├── css/style.css
│   └── js/                  # auth.js compartilhado e scripts das telas
├── sql/academia.sql
├── .gitignore
└── README.md
```

**Responsabilidade de cada parte do back-end:**

- **routes:** dizem qual URL chama qual função.
- **controllers:** validam dados, aplicam regras de negócio e executam o SQL.
- **middlewares:** rodam antes do controller para conferir o token e o perfil do usuário.
- **database:** guarda a conexão com o MySQL e o seed de usuários de desenvolvimento.

## 8. Banco de dados

O script `sql/academia.sql` cria o banco `academia_facil`, as tabelas relacionadas e três planos iniciais. Ele pode ser executado novamente: as tabelas são removidas na ordem das dependências antes de serem recriadas.

| Tabela | Campos e restrições |
|---|---|
| `planos` | `id`, `nome`, `preco`, `duracao_meses` |
| `usuarios` | `id`, `nome`, `email` (único), `senha` (hash bcrypt), `nivel` (ENUM `admin`, `instrutor`, `aluno`), `plano_id` opcional |
| `aulas` | `id`, `titulo`, `descricao`, `dia_hora`, `vagas`, `instrutor_id` |
| `reservas` | `id`, `aluno_id`, `aula_id`, `data_reserva`; UNIQUE em (`aluno_id`, `aula_id`) |

**Relacionamentos e exclusões:** `usuarios.plano_id` referencia `planos.id` e vira `NULL` se o plano for removido; aulas pertencem a um instrutor; reservas pertencem a um aluno e a uma aula. Reservas são removidas junto com aluno ou aula; aulas são removidas junto com o instrutor.

## 9. Regras de negócio previstas

- Não é possível reservar uma aula sem vagas.
- O aluno não pode reservar a mesma aula duas vezes (há uma restrição UNIQUE no banco).
- Só aluno com plano ativo pode reservar.
- O instrutor só pode alterar ou excluir as próprias aulas.
- As permissões são verificadas **também na API**, e não apenas escondendo botões na tela.

As regras de reserva e gestão de aulas/plano descritas aqui serão implementadas na Entrega 3. A restrição contra reserva duplicada já está no banco.

## Status do projeto

| Funcionalidade/arquivo | Status |
|---|---|
| Banco, script SQL, tabelas, chaves e planos iniciais | ✅ Implementado (Entrega 2) |
| Conexão MySQL com pool e variáveis de ambiente | ✅ Implementado (Entrega 2) |
| Cadastro, login com bcrypt e JWT | ✅ Implementado (Entrega 2) |
| Middlewares de autenticação e autorização por perfil | ✅ Implementado (Entrega 2) |
| `GET /auth/perfil` | ✅ Implementado (Entrega 2) |
| `GET /usuarios` restrito ao admin | ✅ Implementado (Entrega 2) |
| Telas de login e cadastro | ✅ Implementado (Entrega 2) |
| Áreas protegidas de aluno, instrutor e admin | ✅ Implementado (Entrega 2) |
| CRUD de aulas | 🕒 Planejado (Entrega 3) |
| Reservas, vagas, duplicidade na API e validação de plano ativo | 🕒 Planejado (Entrega 3) |
| Gestão de planos | 🕒 Planejado (Entrega 3/4) |
| Telas completas de aluno, instrutor e admin | 🕒 Planejado (Entrega 3/4) |

## Como instalar e executar

Pré-requisitos: Node.js e MySQL instalados e em execução.

1. Na raiz do repositório, crie o banco e as tabelas:

   ```bash
   mysql -u root -p < sql/academia.sql
   ```

2. Copie `backend/.env.example` para `backend/.env` e preencha os dados do MySQL. Gere e configure `JWT_SECRET` com:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Instale as dependências, crie os usuários de teste e inicie a API:

   ```bash
   cd backend
   npm install
   npm run seed
   npm start
   ```

4. Abra <http://localhost:3000/login.html> no navegador.

Não envie `backend/.env` ao repositório. O `.gitignore` ignora esse arquivo e `node_modules/`.

## Usuários de teste

O comando `npm run seed` cria os usuários abaixo se seus e-mails ainda não existirem. A senha é `123456` para todos, somente para desenvolvimento.

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | `admin@academia.com` | `123456` |
| Instrutor | `instrutor@academia.com` | `123456` |
| Aluno (plano 1) | `aluno@academia.com` | `123456` |

## Rotas da API (Entrega 2)

| Método | URL | Quem acessa | Descrição |
|---|---|---|---|
| `GET` | `/status` | Público | Confirma que a API está ativa |
| `POST` | `/auth/cadastro` | Público | Cria uma conta de aluno |
| `POST` | `/auth/login` | Público | Valida credenciais e retorna JWT |
| `GET` | `/auth/perfil` | Usuário autenticado | Retorna o próprio perfil, sem senha |
| `GET` | `/usuarios` | Admin autenticado | Lista usuários sem senhas |

## Autenticação e permissões

No login, a API devolve um JWT com o identificador e o nível do usuário. O cliente envia o token no cabeçalho `Authorization: Bearer <token>`. O middleware de autenticação valida o token; o middleware de autorização confere se o nível pode acessar aquela rota. O cadastro público sempre cria um usuário `aluno`, mesmo que o pedido envie outro nível.

## Como testar

Inicie o servidor conforme as instruções anteriores. Os exemplos usam `curl` e assumem que ele está em `http://localhost:3000`.

Cadastro (substitua o e-mail por um que ainda não exista):

```bash
curl -i -X POST http://localhost:3000/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{"nome":"Pessoa Teste","email":"pessoa@exemplo.com","senha":"123456","nivel":"admin"}'
```

Login como admin e aluno (guarde o valor `token` retornado em cada resposta):

```bash
curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"admin@academia.com","senha":"123456"}'
curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"aluno@academia.com","senha":"123456"}'
```

Troque `<TOKEN_ADMIN>` e `<TOKEN_ALUNO>` pelos tokens retornados:

```bash
# Perfil autenticado: 200
curl -i http://localhost:3000/auth/perfil -H "Authorization: Bearer <TOKEN_ADMIN>"
# Perfil sem token: 401
curl -i http://localhost:3000/auth/perfil
# Listagem com token de admin: 200
curl -i http://localhost:3000/usuarios -H "Authorization: Bearer <TOKEN_ADMIN>"
# Listagem com token de aluno: 403
curl -i http://localhost:3000/usuarios -H "Authorization: Bearer <TOKEN_ALUNO>"
# Listagem sem token: 401
curl -i http://localhost:3000/usuarios
```

Para verificar a senha no banco, consulte `SELECT email, senha FROM usuarios;`: o valor de `senha` deve começar com `$2a$` ou `$2b$`, indicando hash bcrypt. O login com senha incorreta retorna `401` com uma mensagem genérica.
