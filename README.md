# Sistema de Agendamento para Barbearia

Aplicação web para gerenciamento de agendamentos em barbearias, com foco em simplicidade para o cliente e controle centralizado pelo administrador.

O sistema permite que clientes realizem agendamentos sem criar conta. O pagamento é feito presencialmente na barbearia.

---

## Visão Geral

O projeto é dividido em duas áreas principais:

- **Área pública**: destinada aos clientes para realização de agendamentos.
- **Área administrativa**: destinada à gestão interna da barbearia.

A aplicação utiliza uma arquitetura moderna, com validações server-side, controle de acesso e integração com banco de dados relacional.

---

## Funcionalidades

### Cliente
- Agendamento sem autenticação
- Seleção de serviço
- Seleção de data e horário disponíveis
- Opção de escolher um barbeiro específico ou deixar a escolha em aberto
- Confirmação do agendamento via WhatsApp
- Cancelamento e reagendamento de horários

### Administrador
- Login seguro via Supabase Auth
- Acesso restrito às rotas administrativas
- Cadastro e gerenciamento de barbeiros
- Definição manual dos horários de trabalho
- Visualização da agenda diária e semanal
- Edição e cancelamento de agendamentos
- Relatórios simples de atendimentos

---

## Tecnologias Utilizadas

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Row Level Security)
- Integração com WhatsApp via deep links

---

## Estrutura do Projeto

```
src/
├─ app/
│  ├─ admin/
│  │  ├─ login/
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ agendar/
│  ├─ api/
│  └─ layout.tsx
├─ components/
│  ├─ booking/
│  └─ layout/
├─ lib/
│  ├─ supabase/
│  └─ data/
├─ types/
└─ middleware.ts
```

---

## Banco de Dados

Principais tabelas utilizadas:

- `admins`
- `barbers`
- `services`
- `barber_schedules`
- `appointments`

A autenticação é gerenciada pelo Supabase Auth. A tabela `admins` referencia usuários autenticados autorizados a acessar o painel administrativo.

---

## Controle de Acesso

- Rotas administrativas protegidas por middleware
- Row Level Security (RLS) configurado no Supabase
- Criação de agendamentos permitida sem autenticação
- Operações administrativas restritas a usuários autorizados

---

## Configuração do Ambiente

Criar um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Observações

Este projeto foi desenvolvido com foco em um MVP funcional, priorizando clareza de código, facilidade de manutenção e possibilidade de evolução futura.
