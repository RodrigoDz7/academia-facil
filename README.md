# Academia Fácil

Sistema web para **agendamento de aulas e controle de alunos em academias**. Projeto da disciplina de Desenvolvimento de Sistemas (Projeto Web), com Node.js, Express, MySQL, HTML, CSS e JavaScript.

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

## 4. Tipos de usuário e ações

| Perfil | O que pode fazer |
|---|---|
| **Admin** | Gerenciar usuários e planos; ver, criar, editar e excluir qualquer aula; ver todas as reservas |
| **Instrutor** | Criar, editar e excluir **somente as próprias aulas**; ver quem reservou nelas |
| **Aluno** | Ver aulas; reservar e cancelar **as próprias** reservas; ver o próprio histórico |

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
- **Back-end:** Node.js e Express
- **Banco de dados:** MySQL (biblioteca `mysql2`)
- **Segurança:** JWT (`jsonwebtoken`) e senhas protegidas com `bcryptjs`
- **Outras:** `dotenv` (configurações) e `cors`

## 7. Estrutura de pastas

```text
academia-facil/
├── backend/
│   ├── server.js            # liga o servidor
│   ├── routes/              # define as URLs da API
│   ├── controllers/         # regras de negócio e SQL
│   ├── middlewares/         # autenticação (JWT) e autorização (perfis)
│   ├── database/            # conexão com o MySQL
│   ├── .env.example         # modelo de configuração (sem senhas)
│   └── package.json
├── frontend/
│   ├── login.html, cadastro.html, aluno.html, instrutor.html, admin.html
│   ├── css/style.css
│   └── js/                  # um arquivo JS por tela
├── sql/
│   └── academia.sql         # script do banco
├── .gitignore
└── README.md
```

**Responsabilidade de cada parte do back-end:**

- **routes:** dizem qual URL chama qual função.
- **controllers:** validam dados, aplicam regras de negócio e executam o SQL.
- **middlewares:** rodam antes do controller para conferir o token e o perfil do usuário.
- **database:** guarda a conexão com o MySQL.

Separar assim deixa cada arquivo com uma função só, o que facilita entender e corrigir o código.

## 8. Banco de dados planejado

| Tabela | Campos principais |
|---|---|
| `planos` | id, nome, preco, duracao_meses |
| `usuarios` | id, nome, email, senha, nivel, plano_id |
| `aulas` | id, titulo, descricao, dia_hora, vagas, instrutor_id |
| `reservas` | id, aluno_id, aula_id, data_reserva |

**Relacionamentos:**

- `usuarios.plano_id` → `planos.id`
- `aulas.instrutor_id` → `usuarios.id`
- `reservas.aluno_id` → `usuarios.id`
- `reservas.aula_id` → `aulas.id`


## 9. Regras de negócio previstas

- Não é possível reservar uma aula sem vagas.
- O aluno não pode reservar a mesma aula duas vezes.
- Só aluno com plano ativo pode reservar.
- O instrutor só pode alterar ou excluir as próprias aulas.
- As permissões serão verificadas **também na API**, e não apenas escondendo botões na tela.
