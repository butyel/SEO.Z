"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { analyzeContent } from "@/lib/ai/content-improvement"
import { createAIProvider } from "@/lib/ai/provider"
import { deterministicChecks, calculateScore } from "@/lib/domain/content-scoring"
import { revalidatePath } from "next/cache"

export async function analyzeContentAction(contentId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autorizado")

  const { data: content } = await supabase
    .from("content_items")
    .select("*, companies!inner(name, city)")
    .eq("id", contentId)
    .single()

  if (!content) throw new Error("Conteúdo não encontrado")

  const company = content.companies as { name: string; city: string }

  const { data: rules } = await supabase
    .from("company_rules")
    .select("*")
    .eq("company_id", content.company_id)
    .maybeSingle()

  const result = await analyzeContent(
    content.content,
    { name: company.name, city: company.city },
    content.main_keyword,
    {
      max_characters: rules?.max_characters,
      require_city: rules?.require_city,
      require_company_name: rules?.require_company_name,
      keyword_in_first_paragraph: rules?.keyword_in_first_paragraph,
      forbidden_terms: rules?.forbidden_terms,
      required_terms: rules?.required_terms,
      use_dashes: rules?.use_dashes,
      max_hashtags: rules?.max_hashtags,
      max_emojis: rules?.max_emojis,
    },
    content.type,
    content
  )

  const checks = deterministicChecks(content.content, {
    max_characters: rules?.max_characters,
    require_city: rules?.require_city,
    require_company_name: rules?.require_company_name,
    keyword_in_first_paragraph: rules?.keyword_in_first_paragraph,
    forbidden_terms: rules?.forbidden_terms,
    required_terms: rules?.required_terms,
    use_dashes: rules?.use_dashes,
    max_hashtags: rules?.max_hashtags,
    max_emojis: rules?.max_emojis,
  }, {
    companyName: company.name,
    city: company.city,
    keyword: content.main_keyword || undefined,
  })

  const scoreResult = calculateScore(
    content.content,
    content.secondary_keywords || [],
    content.type,
    checks,
    result.aiScore > 0 ? { total: result.aiScore, criteria: result.aiCriteria } : undefined
  )

  await supabase
    .from("content_items")
    .update({ score: scoreResult.total })
    .eq("id", contentId)
    .eq("owner_id", user.id)

  const latestVersion = await supabase
    .from("content_versions")
    .select("version")
    .eq("content_id", contentId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestVersion.data) {
    await supabase
      .from("content_versions")
      .update({
        score: scoreResult.total,
        score_details: scoreResult.criteria,
        rule_results: { deterministic: checks, suggestions: result.suggestions },
      })
      .eq("content_id", contentId)
      .eq("version", latestVersion.data.version)
  }

  revalidatePath(`/conteudos/${contentId}`)

  return {
    score: scoreResult.total,
    criteria: scoreResult.criteria,
    maxPerCriterion: scoreResult.maxPerCriterion,
    issues: scoreResult.issues,
    suggestions: scoreResult.suggestions,
    passed: scoreResult.passed,
    aiSuggestions: result.suggestions,
    deterministicIssues: checks.issues,
  }
}

export async function improveContentAction(contentId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autorizado")

  const { data: content } = await supabase
    .from("content_items")
    .select("*, companies!inner(name, city)")
    .eq("id", contentId)
    .single()

  if (!content) throw new Error("Conteúdo não encontrado")

  const company = content.companies as { name: string; city: string }

  if (!content.content) throw new Error("Conteúdo vazio — não é possível melhorar")

  try {
    const provider = createAIProvider()
    const aiInput = {
      title: content.title,
      content: content.content,
      type: content.type,
      mainKeyword: content.main_keyword,
      secondaryKeywords: null,
      searchIntent: content.search_intent,
      city: content.city || company.city,
      targetAudience: content.target_audience,
      objective: content.objective,
      cta: content.cta,
      companyName: company.name,
      rules: {
        formalityLevel: null,
        voiceTone: null,
        forbiddenTerms: null,
        requiredTerms: null,
        maxCharacters: null,
        requireCity: false,
        requireCompanyName: false,
        allowEmojis: true,
        useHashtags: true,
        maxHashtags: null,
      },
    }

    const review = await provider.reviewContent(aiInput)

    if (!review.improvedContent) {
      return { improved: false, message: "IA não sugeriu melhorias para este conteúdo." }
    }

    const newVersion = (content.version || 0) + 1

    const { error: versionError } = await supabase.from("content_versions").insert({
      content_id: contentId,
      owner_id: user.id,
      version: newVersion,
      content: review.improvedContent,
      ai_model: process.env.AI_MODEL || "gpt-4o-mini",
      generation_time_ms: null,
    })

    if (versionError) throw new Error(versionError.message)

    await supabase
      .from("content_items")
      .update({ content: review.improvedContent, version: newVersion })
      .eq("id", contentId)
      .eq("owner_id", user.id)

    revalidatePath(`/conteudos/${contentId}`)

    return { improved: true, content: review.improvedContent, version: newVersion }
  } catch (error) {
    return {
      improved: false,
      message: error instanceof Error ? error.message : "Erro ao melhorar conteúdo com IA",
    }
  }
}

export async function checkAIConfigAction() {
  const provider = process.env.AI_PROVIDER || "openai"
  const hasKey = !!process.env.AI_API_KEY
  const model = process.env.AI_MODEL || "gpt-4o-mini"
  const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1"

  if (!hasKey) {
    return { configured: false, message: "AI_API_KEY não configurada" }
  }

  try {
    const testProvider = createAIProvider()
    await testProvider.reviewContent({
      title: "test",
      content: "test content",
      type: "google_update",
      mainKeyword: null,
      secondaryKeywords: null,
      searchIntent: null,
      city: null,
      targetAudience: null,
      objective: null,
      cta: null,
      companyName: null,
      rules: {
        formalityLevel: null,
        voiceTone: null,
        forbiddenTerms: null,
        requiredTerms: null,
        maxCharacters: null,
        requireCity: false,
        requireCompanyName: false,
        allowEmojis: true,
        useHashtags: true,
        maxHashtags: null,
      },
    })

    return { configured: true, provider, model, baseUrl }
  } catch (error) {
    return {
      configured: false,
      message: error instanceof Error ? error.message : "Falha ao conectar com provedor AI",
      provider,
      model,
      baseUrl,
    }
  }
}
