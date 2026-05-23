# TaskFlow — To-Do App

> Gerenciador de tarefas premium com dashboard analítico

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+

### 1. Instalar dependências

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 2. Rodar o Backend

```bash
cd backend
npm run dev
# Servidor: http://localhost:3001
```

### 3. Rodar o Frontend (em outro terminal)

```bash
cd frontend
npm run dev
# App: http://localhost:5173
```

---

## 🗄️ Banco de Dados

O banco SQLite é criado automaticamente. Para visualizar:

```bash
cd backend && npm run db:studio
```

---

## ✨ Funcionalidades

| Feature | Descrição |
|---------|-----------|
| **Autenticação** | Login e cadastro com JWT |
| **Dashboard** | Métricas: total, concluídas hoje, atrasadas, urgentes |
| **Tarefas** | Criar, editar, deletar, marcar como concluída |
| **Prioridades** | Urgente, Alta, Média, Baixa |
| **Categorias** | Organizações com cores customizáveis |
| **Tags** | Etiquetas livres para cada tarefa |
| **Filtros** | Por status, prioridade, categoria e busca de texto |
| **Design** | Dark mode premium — Obsidian + Amber |

## 🛠️ Stack

- **Frontend**: React 18 + Vite
- **Backend**: Express.js
- **Banco**: SQLite via Prisma ORM
- **Auth**: JWT + bcrypt
