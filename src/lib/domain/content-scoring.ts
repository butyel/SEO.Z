export interface ScoreResult {
  total: number
  criteria: Record<string, number>
  maxPerCriterion: Record<string, number>
  issues: string[]
  suggestions: string[]
  passed: boolean
}

export interface ScoringConfig {
  weights: Record<string, number>
  minScore: number
}

const GOOGLE_POST_WEIGHTS: Record<string, number> = {
  search_intent: 20,
  local_seo: 20,
  eeat: 15,
  geo: 15,
  humanization: 15,
  conversion: 10,
  clarity: 5,
}

const ARTICLE_WEIGHTS: Record<string, number> = {
  technical_seo: 25,
  eeat: 20,
  search_intent: 20,
  geo: 15,
  on_page_seo: 10,
  conversion: 10,
}

export function getWeights(type: string): Record<string, number> {
  if (type === "google_update" || type === "google_cta" || type === "offer" || type === "event") {
    return GOOGLE_POST_WEIGHTS
  }
  return ARTICLE_WEIGHTS
}

export function deterministicChecks(
  content: string | null,
  rules: {
    max_characters?: number | null
    max_google_characters?: number | null
    require_cta?: boolean
    require_city?: boolean
    require_company_name?: boolean
    keyword_in_first_paragraph?: boolean
    forbidden_terms?: string[] | null
    required_terms?: string[] | null
    max_hashtags?: number | null
    max_emojis?: number | null
    use_dashes?: boolean
  },
  context: {
    companyName?: string
    city?: string
    keyword?: string
  }
): { issues: string[]; passed: boolean } {
  const issues: string[] = []
  const text = content || ""

  if (rules.max_characters && text.length > rules.max_characters) {
    issues.push(`Excede limite de ${rules.max_characters} caracteres (${text.length})`)
  }

  if (rules.require_company_name && context.companyName && !text.toLowerCase().includes(context.companyName.toLowerCase())) {
    issues.push("Nome da empresa não encontrado no texto")
  }

  if (rules.require_city && context.city && !text.toLowerCase().includes(context.city.toLowerCase())) {
    issues.push("Cidade não encontrada no texto")
  }

  if (rules.keyword_in_first_paragraph && context.keyword) {
    const firstParagraph = text.split("\n")[0] || text
    if (!firstParagraph.toLowerCase().includes(context.keyword.toLowerCase())) {
      issues.push("Palavra-chave não encontrada no primeiro parágrafo")
    }
  }

  if (rules.forbidden_terms && rules.forbidden_terms.length > 0) {
    for (const term of rules.forbidden_terms) {
      if (text.toLowerCase().includes(term.toLowerCase())) {
        issues.push(`Termo proibido encontrado: "${term}"`)
      }
    }
  }

  if (rules.required_terms && rules.required_terms.length > 0) {
    for (const term of rules.required_terms) {
      if (!text.toLowerCase().includes(term.toLowerCase())) {
        issues.push(`Termo obrigatório ausente: "${term}"`)
      }
    }
  }

  if (!rules.use_dashes) {
    const dashCount = (text.match(/[-–—]/g) || []).length
    if (dashCount > 0) {
      issues.push("Travessões não são permitidos")
    }
  }

  if (rules.max_hashtags) {
    const hashtagCount = (text.match(/#\w+/g) || []).length
    if (hashtagCount > rules.max_hashtags) {
      issues.push(`Excede limite de ${rules.max_hashtags} hashtags (${hashtagCount})`)
    }
  }

  if (rules.max_emojis) {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu
    const emojiCount = (text.match(emojiRegex) || []).length
    if (emojiCount > rules.max_emojis) {
      issues.push(`Excede limite de ${rules.max_emojis} emojis (${emojiCount})`)
    }
  }

  return {
    issues,
    passed: issues.length === 0,
  }
}

export function calculateScore(
  content: string | null,
  contentTypes: string[],
  type: string,
  checks: { issues: string[]; passed: boolean },
  aiScore?: { total: number; criteria: Record<string, number> }
): ScoreResult {
  const weights = getWeights(type)
  const maxPerCriterion: Record<string, number> = {}
  const criteria: Record<string, number> = {}

  for (const [key, weight] of Object.entries(weights)) {
    maxPerCriterion[key] = weight
    criteria[key] = aiScore?.criteria?.[key] ?? Math.round(weight * 0.7)
  }

  const deterministicPenalty = checks.issues.length * 5
  const aiTotal = Object.values(criteria).reduce((a, b) => a + b, 0)
  const total = Math.max(0, Math.min(100, aiTotal - deterministicPenalty))

  const suggestions: string[] = []
  if (checks.issues.length > 0) {
    suggestions.push("Corrija as violações das regras determinísticas")
  }
  if (aiScore && aiScore.total < 60) {
    suggestions.push("O conteúdo precisa de melhorias significativas")
  }

  return {
    total,
    criteria,
    maxPerCriterion,
    issues: checks.issues,
    suggestions,
    passed: total >= 75,
  }
}
