import type { AIContentInput, AIProvider, AISuggestion } from "./provider"
import { createAIProvider } from "./provider"
import { deterministicChecks } from "@/lib/domain/content-scoring"

export interface ContentAnalysisResult {
  score: number
  criteria: Record<string, number>
  suggestions: string[]
  issues: string[]
}

export interface ContentScoreWithAI {
  deterministic: { issues: string[]; passed: boolean }
  aiScore: number
  aiCriteria: Record<string, number>
  aiSuggestions: string[]
  aiIssues: string[]
  hybridScore: number
  suggestions: AISuggestion[]
}

function buildAIContext(
  content: string | null,
  company: { name: string | null; city: string | null },
  keyword: string | null,
  rules: {
    max_characters?: number | null
    require_city?: boolean
    require_company_name?: boolean
    keyword_in_first_paragraph?: boolean
    forbidden_terms?: string[] | null
    required_terms?: string[] | null
    use_dashes?: boolean
    max_hashtags?: number | null
    max_emojis?: number | null
  },
  contentType: string,
  contentItem: { title: string; main_keyword: string | null; search_intent: string | null; target_audience: string | null; objective: string | null; cta: string | null; city: string | null }
): AIContentInput {
  return {
    title: contentItem.title,
    content,
    type: contentType,
    mainKeyword: contentItem.main_keyword || keyword,
    secondaryKeywords: null,
    searchIntent: contentItem.search_intent,
    city: contentItem.city || company.city,
    targetAudience: contentItem.target_audience,
    objective: contentItem.objective,
    cta: contentItem.cta,
    companyName: company.name,
    rules: {
      formalityLevel: null,
      voiceTone: null,
      forbiddenTerms: rules.forbidden_terms || null,
      requiredTerms: rules.required_terms || null,
      maxCharacters: rules.max_characters || null,
      requireCity: rules.require_city || false,
      requireCompanyName: rules.require_company_name || false,
      allowEmojis: rules.max_emojis != null,
      useHashtags: rules.max_hashtags != null,
      maxHashtags: rules.max_hashtags || null,
    },
  }
}

export async function analyzeContent(
  content: string | null,
  company: { name: string | null; city: string | null },
  keyword: string | null,
  rules: {
    max_characters?: number | null
    require_city?: boolean
    require_company_name?: boolean
    keyword_in_first_paragraph?: boolean
    forbidden_terms?: string[] | null
    required_terms?: string[] | null
    use_dashes?: boolean
    max_hashtags?: number | null
    max_emojis?: number | null
  },
  contentType: string,
  contentItem: { title: string; main_keyword: string | null; search_intent: string | null; target_audience: string | null; objective: string | null; cta: string | null; city: string | null }
): Promise<ContentScoreWithAI> {
  const deterministic = deterministicChecks(content, rules, {
    companyName: company.name || undefined,
    city: company.city || undefined,
    keyword: keyword || undefined,
  })

  let aiScore = 0
  let aiCriteria: Record<string, number> = {}
  let aiSuggestions: string[] = []
  let aiIssues: string[] = []
  let improvements: AISuggestion[] = []

  try {
    const provider: AIProvider = createAIProvider()
    const aiInput = buildAIContext(content, company, keyword, rules, contentType, contentItem)

    const [reviewResult, suggestionResults] = await Promise.all([
      provider.reviewContent(aiInput).catch(() => null),
      provider.suggestImprovements(aiInput).catch(() => [] as AISuggestion[]),
    ])

    if (reviewResult) {
      aiScore = reviewResult.score
      aiCriteria = reviewResult.criteria
      aiSuggestions = reviewResult.suggestions
      aiIssues = reviewResult.issues
    }

    improvements = suggestionResults || []
  } catch {
    // AI unavailable — fallback to deterministic only
  }

  const deterministicPenalty = deterministic.issues.length * 5
  const aiTotal = Object.values(aiCriteria).reduce((a, b) => a + b, 0)
  const hybridScore = Math.max(0, Math.min(100, aiTotal - deterministicPenalty))

  const suggestions = [...aiSuggestions]
  if (deterministic.issues.length > 0) {
    suggestions.push("Corrija as violações das regras determinísticas")
  }
  if (hybridScore < 60) {
    suggestions.push("O conteúdo precisa de melhorias significativas")
  }

  return {
    deterministic,
    aiScore,
    aiCriteria,
    aiSuggestions,
    aiIssues,
    hybridScore,
    suggestions: improvements,
  }
}
