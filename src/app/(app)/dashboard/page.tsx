import { createServerSupabaseClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, FileText, Star, Calendar, AlertTriangle, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { count: activeCompanies } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const { count: pendingContent } = await supabase
    .from("content_items")
    .select("*", { count: "exact", head: true })
    .in("status", ["draft", "review", "needs_adjustments"])

  const { count: scheduledContent } = await supabase
    .from("content_items")
    .select("*", { count: "exact", head: true })
    .eq("status", "scheduled")

  const { count: pendingReviews } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .neq("response_status", "approved")
    .neq("response_status", "responded_via_api")
    .neq("response_status", "responded_manually")

  const { data: recentContents } = await supabase
    .from("content_items")
    .select("id, title, status, created_at, companies(name)")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu ecossistema de SEO Local</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCompanies ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conteúdos Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingContent ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledContent ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações Pendentes</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReviews ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Precisa de Atenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!activeCompanies ? (
            <div className="text-sm text-muted-foreground">
              Nenhuma empresa cadastrada. <Link href="/empresas/nova" className="text-primary hover:underline">Crie sua primeira empresa</Link> para começar.
            </div>
          ) : (
            <div className="space-y-2">
              {activeCompanies > 0 && pendingContent === 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Dica</Badge>
                  Empresas ativas mas sem conteúdo pendente. Considere criar novos conteúdos.
                </div>
              )}
              {recentContents && recentContents.length === 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Dica</Badge>
                  Nenhum conteúdo criado recentemente.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {recentContents && recentContents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentContents.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.title}</span>
                    <span className="text-muted-foreground ml-2">
                      {(item as unknown as { companies?: { name: string } }).companies?.name}
                    </span>
                  </div>
                  <Badge variant={
                    item.status === "published" ? "published" :
                    item.status === "approved" ? "approved" :
                    item.status === "scheduled" ? "scheduled" :
                    item.status === "draft" ? "draft" : "secondary"
                  }>
                    {item.status === "published" ? "Publicado" :
                     item.status === "approved" ? "Aprovado" :
                     item.status === "scheduled" ? "Programado" : item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
