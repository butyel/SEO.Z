import { describe, it, expect } from "vitest"
import { deterministicChecks, calculateScore, getWeights } from "@/lib/domain/content-scoring"

describe("Content Scoring - Weights", () => {
  it("returns Google post weights for google_update type", () => {
    const weights = getWeights("google_update")
    expect(weights.search_intent).toBe(20)
    expect(weights.local_seo).toBe(20)
    expect(Object.values(weights).reduce((a, b) => a + b, 0)).toBe(100)
  })

  it("returns Google post weights for google_cta type", () => {
    const weights = getWeights("google_cta")
    expect(weights.conversion).toBe(10)
    expect(Object.values(weights).reduce((a, b) => a + b, 0)).toBe(100)
  })

  it("returns article weights for blog type", () => {
    const weights = getWeights("blog")
    expect(weights.technical_seo).toBe(25)
    expect(Object.values(weights).reduce((a, b) => a + b, 0)).toBe(100)
  })
})

describe("Content Scoring - Deterministic Checks", () => {
  it("passes when no rules are violated", () => {
    const result = deterministicChecks(
      "Empresa XYZ oferece serviços em São Paulo com qualidade.",
      {
        max_characters: 500,
        require_company_name: true,
        require_city: true,
      },
      { companyName: "Empresa XYZ", city: "São Paulo" }
    )
    expect(result.passed).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it("fails when exceeding max characters", () => {
    const result = deterministicChecks(
      "A".repeat(600),
      { max_characters: 500 },
      {}
    )
    expect(result.passed).toBe(false)
    expect(result.issues.some(i => i.includes("caracteres"))).toBe(true)
  })

  it("fails when company name is missing", () => {
    const result = deterministicChecks(
      "Serviço de qualidade.",
      { require_company_name: true },
      { companyName: "Empresa Teste" }
    )
    expect(result.passed).toBe(false)
    expect(result.issues.some(i => i.includes("empresa"))).toBe(true)
  })

  it("fails when city is missing", () => {
    const result = deterministicChecks(
      "Conteúdo sem cidade.",
      { require_city: true },
      { city: "São Paulo" }
    )
    expect(result.passed).toBe(false)
  })

  it("detects forbidden terms", () => {
    const result = deterministicChecks(
      "Este é o melhor preço da cidade!",
      { forbidden_terms: ["preço"] },
      {}
    )
    expect(result.passed).toBe(false)
    expect(result.issues.some(i => i.includes("preço"))).toBe(true)
  })

  it("detects missing required terms", () => {
    const result = deterministicChecks(
      "Conteúdo simples.",
      { required_terms: ["garantia", "qualidade"] },
      {}
    )
    expect(result.passed).toBe(false)
    expect(result.issues.length).toBe(2)
  })

  it("detects dashes when not allowed", () => {
    const result = deterministicChecks(
      "Texto com — travessão.",
      { use_dashes: false },
      {}
    )
    expect(result.passed).toBe(false)
  })

  it("detects excessive hashtags", () => {
    const result = deterministicChecks(
      "#tag1 #tag2 #tag3 #tag4",
      { max_hashtags: 3 },
      {}
    )
    expect(result.passed).toBe(false)
  })

  it("handles empty content gracefully", () => {
    const result = deterministicChecks(null, {}, {})
    expect(result.passed).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
})

describe("Content Scoring - Score Calculation", () => {
  it("calculates score with no issues", () => {
    const result = calculateScore(
      "Bom conteúdo.",
      [],
      "google_update",
      { issues: [], passed: true }
    )
    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result.total).toBeLessThanOrEqual(100)
  })

  it("applies penalty for deterministic issues", () => {
    const withIssues = calculateScore(
      "Curto.",
      [],
      "google_update",
      { issues: ["Problema 1", "Problema 2"], passed: false }
    )
    const withoutIssues = calculateScore(
      "Bom conteúdo completo e bem escrito para SEO.",
      [],
      "google_update",
      { issues: [], passed: true }
    )
    expect(withIssues.total).toBeLessThanOrEqual(withoutIssues.total)
  })

  it("uses AI score when provided", () => {
    const result = calculateScore(
      "Conteúdo.",
      [],
      "google_update",
      { issues: [], passed: true },
      { total: 85, criteria: { search_intent: 18, local_seo: 17, eeat: 13, geo: 12, humanization: 13, conversion: 7, clarity: 5 } }
    )
    expect(result.total).toBeGreaterThan(0)
  })

  it("returns passed false for low scores", () => {
    const result = calculateScore(
      "",
      [],
      "google_update",
      { issues: ["Muitos problemas", "Mais problemas", "Ainda mais"], passed: false },
      { total: 30, criteria: { search_intent: 5, local_seo: 5, eeat: 5, geo: 5, humanization: 5, conversion: 3, clarity: 2 } }
    )
    expect(result.passed).toBe(false)
  })
})
