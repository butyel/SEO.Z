# Integração Google Business Profile

## Arquitetura
Provider pattern com interface abstrata:
- `MockGoogleBusinessProfileProvider` — para desenvolvimento e teste
- `GoogleApiBusinessProfileProvider` — para produção

## OAuth
- Fluxo OAuth 2.0 com escopo mínimo
- Tokens criptografados no servidor
- Refresh token armazenado com segurança
- State CSRF
- Renovação automática

## Funcionalidades
- Listar contas autorizadas
- Importar unidades
- Criar, editar, excluir postagens
- Sincronizar avaliações
- Responder avaliações
- Upload de mídia
- Consultar métricas
- Palavras de pesquisa

## Feature Flags
- `GOOGLE_INTEGRATION_ENABLED`
- `GOOGLE_PUBLISHING_ENABLED`
- `GOOGLE_REVIEWS_ENABLED`
- `GOOGLE_MEDIA_ENABLED`
- `GOOGLE_PERFORMANCE_ENABLED`
- `GOOGLE_SERVICES_SYNC_ENABLED`

## Segurança
- Tokens não saem do servidor
- Criptografia com `TOKEN_ENCRYPTION_KEY`
- URLs de mídia são temporárias e controladas
