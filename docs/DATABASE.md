# Banco de Dados

## Tecnologia
Supabase PostgreSQL com Row Level Security.

## Tabelas Principais

### Usuário e Configurações
- `profiles`
- `app_settings`
- `ai_settings`
- `prompt_templates`
- `prompt_versions`

### Empresas
- `companies`
- `company_locations`
- `company_branding`
- `company_rules`
- `company_knowledge`
- `company_sources`
- `company_competitors`

### Estratégia
- `keywords`
- `keyword_clusters`
- `entities`
- `content_topics`
- `seasonal_events`

### Serviços
- `services`
- `service_versions`
- `service_sync_logs`

### Conteúdo
- `content_plans`
- `content_plan_items`
- `content_items`
- `content_versions`
- `content_scores`
- `content_rule_results`
- `content_sources`
- `content_media`

### Mídia
- `media_assets`
- `media_tags`

### Avaliações
- `reviews`
- `review_response_versions`

### Google
- `google_connections`
- `google_accounts`
- `google_locations`
- `google_sync_logs`
- `google_performance_metrics`
- `google_search_keywords`

### Operação
- `publishing_jobs`
- `audit_runs`
- `audit_items`
- `reports`
- `activity_logs`
- `notifications`

## Campos Comuns
- `id uuid DEFAULT gen_random_uuid()`
- `owner_id uuid REFERENCES auth.users(id)`
- `company_id uuid REFERENCES companies(id)` (quando aplicável)
- `location_id uuid REFERENCES company_locations(id)` (quando aplicável)
- `created_at timestamptz DEFAULT now()`
- `updated_at timestamptz DEFAULT now()`
- `archived_at timestamptz` (quando aplicável)

## RLS
Todas as tabelas expostas possuem RLS vinculado a `auth.uid()`.
