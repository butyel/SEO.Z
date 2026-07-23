# Segurança

## Autenticação
- Supabase Auth com e-mail/senha
- Apenas e-mails em `ADMIN_EMAILS` têm acesso
- Sem cadastro público
- Middleware protege todas as rotas internas

## RLS
- Todas as tabelas expostas possuem RLS
- Política baseada em `auth.uid()` e `owner_id`
- Tabelas filhas validam proprietário indiretamente

## Tokens do Google
- Criptografados com `TOKEN_ENCRYPTION_KEY`
- Refresh token nunca enviado ao navegador
- Service role key somente no servidor

## Proteções
- Validação Zod em todas as entradas
- Sanitização de campos
- Rate limit em geração por IA e publicação
- Confirmação para ações destrutivas
- Soft delete
- Prevenção de SSRF
- Cookies seguros em produção
- Idempotência em operações de publicação
