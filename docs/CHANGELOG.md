# Changelog

## [0.1.0] — 2026-07-22
### Adicionado
- Inicialização do projeto Next.js 16 + TypeScript strict + Tailwind CSS
- Sistema de autenticação com Supabase (SSR)
- Middleware/Proxy de proteção de rotas
- Layout com sidebar escura e header
- Módulo completo de Empresas (CRUD, listagem, detalhes, 10 sub-páginas)
- Módulo de Conteúdos (criação, listagem, detalhes, versões)
- Dashboard com cards e feed de atividades
- Páginas placeholder para todos os módulos
- Sistema de pontuação semáforo (determinístico + IA)
- 30+ tabelas de banco com migrations SQL
- Row Level Security em todas as tabelas
- Testes (46 testes, 6 suites)
- Documentação completa (PRD, Architecture, Database, Security, Roadmap, etc.)
- AGENTS.md com regras permanentes
- .env.example

### Infrastructure
- Next.js 16.2.11, React 19.2.4
- Supabase Auth + PostgreSQL + RLS
- shadcn/ui components customizados (sem Radix UI)
- Lucide icons
- Zod validation
- Componentes Server por padrão, Client quando necessário
- Vitest + Testing Library

### Routes
- `/login` — Autenticação
- `/dashboard` — Visão geral
- `/empresas` — CRUD completo
- `/empresas/nova` — Cadastro
- `/empresas/[companyId]/*` — 10 sub-páginas
- `/conteudos` — Listagem e gerenciamento
- `/conteudos/novo` — Criação
- `/conteudos/[contentId]` — Detalhes
- `/configuracoes/*` — 5 páginas de configuração
- `/calendario`, `/servicos`, `/avaliacoes`, `/midias`, `/auditorias`, `/relatorios`
