# Pipeline de IA

## Arquitetura
Provider pattern:
```ts
interface AIProvider {
  generateStructuredContent(input: AIContentInput): Promise<AIContentResult>;
  reviewContent(input: AIReviewInput): Promise<AIReviewResult>;
}
```

## Provedores
- Configurável via variáveis de ambiente
- Suporte inicial a API compatível com OpenAI
- Modelo, URL base, chave configuráveis

## Pipeline
1. Coleta do briefing
2. Validação das informações
3. Identificação da intenção de busca
4. Seleção de palavras-chave
5. Seleção de entidades
6. Criação do outline
7. Escrita inicial
8. Aplicação de EEAT
9. Aplicação de SEO Local
10. Aplicação de GEO
11. Humanização
12. Revisão técnica
13. Verificação de fatos
14. Detecção de repetição
15. Avaliação (semáforo)
16. Versão final

## Prompts
- Versionados e armazenados em banco
- Editáveis no painel de configurações
- Histórico de versões mantido

## Segurança
- Não enviar dados desnecessários para IA
- Não armazenar segredos em logs
- Validar saída com Zod
