import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BadgeCheck } from "lucide-react"

interface PageProps {
  params: Promise<{ companyId: string }>
}

export default async function PalavrasChavePage({ params }: PageProps) {
  const { companyId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: keywords } = await supabase
    .from("keywords")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "active")
    .order("priority")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Palavras-chave</h1>

      {!keywords || keywords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BadgeCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhuma palavra-chave cadastrada</p>
            <p className="text-sm text-muted-foreground">Cadastre palavras-chave para orientar a criação de conteúdo.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keywords.map((kw) => (
            <Card key={kw.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{kw.keyword}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{kw.intent || "N/A"}</Badge>
                    {kw.priority && (
                      <Badge variant={kw.priority === "high" ? "destructive" : kw.priority === "medium" ? "default" : "secondary"}>
                        {kw.priority === "high" ? "Alta" : kw.priority === "medium" ? "Média" : "Baixa"}
                      </Badge>
                    )}
                    {kw.volume && <span className="text-xs text-muted-foreground">Vol: {kw.volume}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
