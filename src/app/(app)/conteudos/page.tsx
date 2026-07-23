import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"
import Link from "next/link"

const statusLabels: Record<string, { label: string; variant: "idea" | "draft" | "review" | "needs_adjustments" | "approved" | "published" | "failed" | "scheduled" }> = {
  idea: { label: "Ideia", variant: "idea" },
  draft: { label: "Rascunho", variant: "draft" },
  generating: { label: "Gerando", variant: "draft" },
  review: { label: "Em Revisão", variant: "review" },
  needs_adjustments: { label: "Ajustes", variant: "needs_adjustments" },
  approved: { label: "Aprovado", variant: "approved" },
  scheduled: { label: "Programado", variant: "scheduled" },
  publishing: { label: "Publicando", variant: "draft" },
  published: { label: "Publicado", variant: "published" },
  failed: { label: "Falhou", variant: "failed" },
  cancelled: { label: "Cancelado", variant: "draft" },
  archived: { label: "Arquivado", variant: "draft" },
}

export default async function ConteudosPage() {
  const supabase = await createServerSupabaseClient()

  const { data: contents } = await supabase
    .from("content_items")
    .select("*, companies(name)")
    .neq("status", "archived")
    .order("updated_at", { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conteúdos</h1>
          <p className="text-muted-foreground">Gerencie todos os conteúdos</p>
        </div>
        <Button asChild>
          <Link href="/conteudos/novo">
            <Plus className="h-4 w-4" />
            Novo Conteúdo
          </Link>
        </Button>
      </div>

      {!contents || contents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhum conteúdo criado</p>
            <p className="text-sm text-muted-foreground mb-4">
              Crie conteúdos para suas empresas e gerencie tudo em um só lugar.
            </p>
            <Button asChild>
              <Link href="/conteudos/novo">
                <Plus className="h-4 w-4" />
                Novo Conteúdo
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contents.map((item) => {
            const statusInfo = statusLabels[item.status] || { label: item.status, variant: "draft" as const }
            return (
              <Link key={item.id} href={`/conteudos/${item.id}`}>
                <Card className="transition-colors hover:bg-accent/50 cursor-pointer">
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <CardDescription>
                      {(item as unknown as { companies?: { name: string } }).companies?.name && `${(item as unknown as { companies?: { name: string } }).companies!.name} · `}
                      {item.type?.replace(/_/g, " ")}
                      {item.scheduled_at && ` · ${new Date(item.scheduled_at).toLocaleDateString("pt-BR")}`}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
