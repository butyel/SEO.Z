import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"
import { AIPanel } from "@/components/ai/ai-panel"

interface PageProps {
  params: Promise<{ contentId: string }>
}

const statusLabels: Record<string, { label: string; variant: "idea" | "draft" | "review" | "needs_adjustments" | "approved" | "published" | "failed" | "scheduled" }> = {
  idea: { label: "Ideia", variant: "idea" },
  draft: { label: "Rascunho", variant: "draft" },
  generating: { label: "Gerando", variant: "draft" },
  review: { label: "Em Revisão", variant: "review" },
  needs_adjustments: { label: "Ajustes", variant: "needs_adjustments" },
  approved: { label: "Aprovado", variant: "approved" },
  scheduled: { label: "Programado", variant: "scheduled" },
  published: { label: "Publicado", variant: "published" },
  failed: { label: "Falhou", variant: "failed" },
}

export default async function ConteudoDetailPage({ params }: PageProps) {
  const { contentId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: content } = await supabase
    .from("content_items")
    .select("*, companies(name)")
    .eq("id", contentId)
    .single()

  if (!content) notFound()

  const { data: versions } = await supabase
    .from("content_versions")
    .select("version, created_at")
    .eq("content_id", contentId)
    .order("version", { ascending: false })
    .limit(5)

  const statusInfo = statusLabels[content.status] || { label: content.status, variant: "draft" as const }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/conteudos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{content.title}</h1>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <p className="text-muted-foreground">
            {(content as unknown as { companies?: { name: string } }).companies?.name && `${(content as unknown as { companies?: { name: string } }).companies!.name} · `}
            {content.type?.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Palavra-chave</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{content.main_keyword || "N/A"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pontuação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{content.score != null ? `${content.score}/100` : "Não avaliado"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Versões</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{versions?.length || 1}</p>
          </CardContent>
        </Card>
      </div>

      {content.content ? (
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
              {content.content}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {content.content.length} caracteres
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Conteúdo vazio</p>
            <p className="text-sm text-muted-foreground">Este conteúdo ainda não possui texto.</p>
          </CardContent>
        </Card>
      )}

      {content.scheduled_at && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Programado para
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {new Date(content.scheduled_at).toLocaleDateString("pt-BR", {
                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
              })}
            </p>
          </CardContent>
        </Card>
      )}

      {content.score_override && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <CheckCircle className="h-4 w-4" />
              Override de Pontuação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Motivo: {content.score_override_reason}
            </p>
            <p className="text-xs text-muted-foreground">
              {content.score_override_at && new Date(content.score_override_at).toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      )}

      <AIPanel contentId={contentId} />
    </div>
  )
}
