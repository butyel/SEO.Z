# Arquitetura

## Stack
- **Frontend/Backend**: Next.js 14+ com App Router
- **Linguagem**: TypeScript strict
- **UI**: Tailwind CSS + shadcn/ui + Lucide
- **Forms**: React Hook Form + Zod
- **Datas**: date-fns com fuso horário
- **Banco**: Supabase PostgreSQL
- **Autenticação**: Supabase Auth (SSR)
- **Armazenamento**: Supabase Storage
- **Testes**: Vitest + Testing Library + Playwright
- **Qualidade**: ESLint + Prettier

## Estrutura de Diretórios
```
src/
  app/          # Next.js App Router pages
  components/   # UI components
  lib/          # Core libraries, config, utils
  features/     # Feature modules
  providers/    # Abstract providers (AI, Google)
  hooks/        # React hooks
  types/        # Shared types
  validations/  # Zod schemas
  db/           # Migrations, queries
```

## Princípios
- Server Components por padrão
- Client Components apenas quando necessário
- Separação entre UI, domínio, persistência e integrações
- Pipeline modular de IA
- Provider pattern para Google e IA
