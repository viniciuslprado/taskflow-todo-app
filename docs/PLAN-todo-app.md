# Plano do Projeto: To-Do App com Dashboard

## 1. Visão Geral
Um aplicativo de gerenciamento de tarefas (To-Do) com foco em uma experiência visual (dashboard) de alta qualidade. O usuário pode gerenciar suas atividades, categorizá-las e acompanhar métricas de produtividade.

## 2. Requisitos Principais
- **Autenticação:** Login de usuários.
- **Gerenciamento de Tarefas:** Criar, editar, excluir tarefas (título, descrição, data limite).
- **Classificação:** Prioridade (Baixa, Média, Alta), Categorias (Trabalho, Casa, Estudos) e Tags.
- **Dashboard:** Visão geral com contadores (total, concluídas hoje, atrasadas).

## 3. Arquitetura Proposta (Baseada na Stack Escolhida)
- **Frontend:** React (Vite ou Next.js) com TailwindCSS / Framer Motion para animações da dashboard.
- **Backend:** Express.js (ou Next.js API Routes).
- **Banco de Dados:** SQLite integrado com Prisma ORM ou Drizzle ORM para facilitar a modelagem.

## 4. Divisão de Tarefas (To-Dos)

### Fase 1: Setup e Infraestrutura
- [ ] Inicializar o repositório do projeto.
- [ ] Configurar o backend (Express) e o banco de dados (SQLite).
- [ ] Configurar o ORM (Prisma) e criar o Schema inicial (User, Task, Category, Tag).
- [ ] Configurar o frontend (React) com as ferramentas de roteamento e estilização.

### Fase 2: Backend & APIs
- [ ] Criar endpoints de Autenticação (Registro e Login com JWT).
- [ ] Criar endpoints de CRUD para Tarefas (GET, POST, PUT, DELETE).
- [ ] Criar endpoint para as Estatísticas da Dashboard.

### Fase 3: Frontend - Interface Base e Autenticação
- [ ] Desenvolver o design system base (cores, tipografia, componentes base).
- [ ] Implementar a tela de Login e Registro.
- [ ] Configurar o gerenciamento de estado global e consumo da API (ex: React Query).

### Fase 4: Frontend - Dashboard e Tarefas
- [ ] Construir a UI da Dashboard (Cartões de estatísticas: Total, Feitas Hoje, Atrasadas).
- [ ] Construir a listagem de tarefas com filtros (Prioridade, Categoria, Tags).
- [ ] Criar o formulário/modal de criação e edição de tarefas.

### Fase 5: Refinamento e UX
- [ ] Adicionar micro-interações e animações aos botões e modais.
- [ ] Tratamento de erros globais (toasts, feedbacks visuais).
- [ ] Auditoria final (Segurança, Lint, UX, Responsividade).

## 5. Próximos Passos
Aguardar as respostas do usuário às perguntas de descoberta (Socratic Gate) para ajustar os detalhes de Autenticação e UX.
