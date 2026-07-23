import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchCheck } from "lucide-react"

interface PageProps {
  params: Promise<{ companyId: string }>
}

export default async function AuditoriasPage({ params }: PageProps) {
  const { companyId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: audits } = await supabase
    .from("audit_runs")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Auditorias</h1>

      {!audits || audits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <SearchCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhuma auditoria realizada</p>
            <p className="text-sm text-muted-foreground">Execute auditorias para avaliar a saúde do perfil da empresa.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {audits.map((audit) => (
            <Card key={audit.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{audit.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(audit.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {audit.total_score != null && (
                  <div className="text-2xl font-bold">{audit.total_score}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
