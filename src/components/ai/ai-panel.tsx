"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, RefreshCw, AlertTriangle, CheckCircle2, Lightbulb, XCircle } from "lucide-react"

interface AnalysisResult {
  score: number
  criteria: Record<string, number>
  maxPerCriterion: Record<string, number>
  issues: string[]
  suggestions: string[]
  passed: boolean
  aiSuggestions: { category: string; title: string; description: string; action: string }[]
  deterministicIssues: string[]
}

interface ImproveResult {
  improved: boolean
  content?: string
  message?: string
  version?: number
}

export function AIPanel({ contentId }: { contentId: string }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [improving, setImproving] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [improveResult, setImproveResult] = useState<ImproveResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    setAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao analisar")
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar conteúdo")
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleImprove() {
    setImproving(true)
    setImproveResult(null)
    setError(null)

    try {
      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao melhorar")
      setImproveResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao melhorar conteúdo")
    } finally {
      setImproving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Análise com IA
          </CardTitle>
          <CardDescription>
            Analise o conteúdo com IA para obter pontuação, sugestões e melhorias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && !improveResult && !error && (
            <p className="text-sm text-muted-foreground">
              Clique em "Analisar" para avaliar o conteúdo com IA.
            </p>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{result.score}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
                {result.passed ? (
                  <Badge variant="approved">Aprovado</Badge>
                ) : (
                  <Badge variant="needs_adjustments">Ajustes necessários</Badge>
                )}
              </div>

              {Object.entries(result.criteria).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Critérios</p>
                  {Object.entries(result.criteria).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <span className="w-32 text-muted-foreground capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            value >= (result.maxPerCriterion[key] || 1) * 0.8
                              ? "bg-green-500"
                              : value >= (result.maxPerCriterion[key] || 1) * 0.5
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${((value / (result.maxPerCriterion[key] || 1)) * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-muted-foreground">
                        {value}/{result.maxPerCriterion[key] || 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {result.issues.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Problemas
                  </p>
                  {result.issues.map((issue, i) => (
                    <p key={i} className="text-sm text-destructive/80 ml-5">
                      • {issue}
                    </p>
                  ))}
                </div>
              )}

              {result.suggestions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-600 flex items-center gap-1">
                    <Lightbulb className="h-4 w-4" />
                    Sugestões
                  </p>
                  {result.suggestions.map((s, i) => (
                    <p key={i} className="text-sm text-muted-foreground ml-5">
                      • {s}
                    </p>
                  ))}
                </div>
              )}

              {result.aiSuggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    Melhorias sugeridas pela IA
                  </p>
                  {result.aiSuggestions.map((s, i) => (
                    <div key={i} className="rounded-md border p-3">
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {s.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {improveResult && (
            <div
              className={`flex items-start gap-2 rounded-md p-3 text-sm ${
                improveResult.improved
                  ? "bg-green-500/10 text-green-700"
                  : "bg-yellow-500/10 text-yellow-700"
              }`}
            >
              {improveResult.improved ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium">
                  {improveResult.improved
                    ? `Conteúdo melhorado! (versão ${improveResult.version})`
                    : "Nenhuma melhoria aplicada"}
                </p>
                {improveResult.message && (
                  <p className="text-muted-foreground mt-1">{improveResult.message}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {analyzing ? "Analisando..." : "Analisar"}
          </Button>
          <Button
            variant="outline"
            onClick={handleImprove}
            disabled={improving}
          >
            {improving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {improving ? "Melhorando..." : "Melhorar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
