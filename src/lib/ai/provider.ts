export interface AIProviderConfig {
  provider: string
  apiKey: string
  model: string
  baseUrl: string
}

export interface AIContentInput {
  title: string
  content: string | null
  type: string
  mainKeyword: string | null
  secondaryKeywords: string[] | null
  searchIntent: string | null
  city: string | null
  targetAudience: string | null
  objective: string | null
  cta: string | null
  companyName: string | null
  rules: {
    formalityLevel: string | null
    voiceTone: string | null
    forbiddenTerms: string[] | null
    requiredTerms: string[] | null
    maxCharacters: number | null
    requireCity: boolean
    requireCompanyName: boolean
    allowEmojis: boolean
    useHashtags: boolean
    maxHashtags: number | null
  }
}

export interface AIReviewResult {
  score: number
  criteria: Record<string, number>
  suggestions: string[]
  improvedContent?: string
  issues: string[]
}

export interface AISuggestion {
  category: string
  title: string
  description: string
  action: "improve_content" | "add_section" | "rewrite" | "fix_issue"
}

export interface AIProvider {
  reviewContent(input: AIContentInput): Promise<AIReviewResult>
  suggestImprovements(input: AIContentInput): Promise<AISuggestion[]>
}

function getConfig(): AIProviderConfig {
  return {
    provider: process.env.AI_PROVIDER || "openai",
    apiKey: process.env.AI_API_KEY || "",
    model: process.env.AI_MODEL || "gpt-4o-mini",
    baseUrl: process.env.AI_BASE_URL || "https://api.openai.com/v1",
  }
}

const SYSTEM_PROMPT_REVIEW = `Você é um especialista em SEO Local e marketing de conteúdo.
Analise o conteúdo fornecido e retorne UM OBJETO JSON válido (sem markdown, sem código, apenas o JSON puro) com:
{
  "score": número de 0 a 100,
  "criteria": { "search_intent": 0-20, "local_seo": 0-20, "eeat": 0-15, "geo": 0-15, "humanization": 0-15, "conversion": 0-10, "clarity": 0-5 },
  "suggestions": ["string"],
  "issues": ["string"],
  "improvedContent": "versão melhorada do texto (opcional, somente se existirem issues graves)"
}

Regras de avaliação:
- search_intent: O conteúdo atende à intenção de busca?
- local_seo: Contém informações locais relevantes?
- eeat: Demonstra experiência, autoridade e confiança?
- geo: Otimizado para busca geográfica?
- humanization: Linguagem natural e envolvente?
- conversion: Possui call-to-action claro?
- clarity: O texto é claro e bem estruturado?`

const SYSTEM_PROMPT_SUGGEST = `Você é um especialista em SEO Local.
Analise o conteúdo e sugira melhorias específicas.

Retorne UM ARRAY JSON válido (sem markdown, sem código, apenas o JSON puro) de sugestões, cada uma com:
{
  "category": "estrutura" | "seo" | "conteudo" | "local" | "estilo",
  "title": "título curto da sugestão",
  "description": "descrição detalhada",
  "action": "improve_content" | "add_section" | "rewrite" | "fix_issue"
}

Máximo de 5 sugestões. Seja prático e acionável.`

async function callAI(
  systemPrompt: string,
  userPrompt: string,
  config: AIProviderConfig
): Promise<string> {
  const supportsJsonMode = !config.baseUrl.includes("ollama") && !config.baseUrl.includes("localhost")

  const body: Record<string, unknown> = {
    model: config.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
  }

  if (supportsJsonMode) {
    body.response_format = { type: "json_object" }
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AI API error: ${response.status} ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

function buildReviewPrompt(input: AIContentInput): string {
  return JSON.stringify({
    title: input.title,
    content: input.content || "(sem conteúdo)",
    type: input.type,
    keyword: input.mainKeyword,
    secondary_keywords: input.secondaryKeywords,
    intent: input.searchIntent,
    city: input.city,
    audience: input.targetAudience,
    objective: input.objective,
    cta: input.cta,
    company: input.companyName,
    rules: input.rules,
  })
}

function buildSuggestPrompt(input: AIContentInput): string {
  return `Conteúdo atual:
Título: ${input.title}
Texto: ${input.content || "(vazio)"}
Tipo: ${input.type}
Palavra-chave: ${input.mainKeyword || "N/A"}
Cidade: ${input.city || "N/A"}
Empresa: ${input.companyName || "N/A"}
CTA: ${input.cta || "N/A"}

Sugira melhorias específicas para SEO Local.`
}

class OpenAIProvider implements AIProvider {
  private config: AIProviderConfig

  constructor(config: AIProviderConfig) {
    this.config = config
  }

  async reviewContent(input: AIContentInput): Promise<AIReviewResult> {
    const prompt = buildReviewPrompt(input)
    const raw = await callAI(SYSTEM_PROMPT_REVIEW, prompt, this.config)
    const parsed = JSON.parse(raw)

    return {
      score: Math.max(0, Math.min(100, parsed.score || 0)),
      criteria: {
        search_intent: parsed.criteria?.search_intent ?? 0,
        local_seo: parsed.criteria?.local_seo ?? 0,
        eeat: parsed.criteria?.eeat ?? 0,
        geo: parsed.criteria?.geo ?? 0,
        humanization: parsed.criteria?.humanization ?? 0,
        conversion: parsed.criteria?.conversion ?? 0,
        clarity: parsed.criteria?.clarity ?? 0,
      },
      suggestions: parsed.suggestions || [],
      issues: parsed.issues || [],
      improvedContent: parsed.improvedContent,
    }
  }

  async suggestImprovements(input: AIContentInput): Promise<AISuggestion[]> {
    const prompt = buildSuggestPrompt(input)
    const raw = await callAI(SYSTEM_PROMPT_SUGGEST, prompt, this.config)
    const parsed = JSON.parse(raw)

    if (Array.isArray(parsed)) return parsed.slice(0, 5)
    if (Array.isArray(parsed.suggestions)) return parsed.suggestions.slice(0, 5)
    return []
  }
}

export function createAIProvider(): AIProvider {
  const config = getConfig()

  if (!config.apiKey) {
    throw new Error("AI_API_KEY não configurada. Defina a variável de ambiente AI_API_KEY.")
  }

  switch (config.provider) {
    case "openai":
    case "openai-compatible":
      return new OpenAIProvider(config)
    default:
      return new OpenAIProvider(config)
  }
}
