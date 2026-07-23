import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen } from "lucide-react"

interface PageProps {
  params: Promise<{ companyId: string }>
}

export default async function ConhecimentoPage({ params }: PageProps) {
  const { companyId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: knowledge } = await supabase
    .from("company_knowledge")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Base de Conhecimento</h1>

      {!knowledge || knowledge.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhum registro encontrado</p>
            <p className="text-sm text-muted-foreground">Adicione fatos, serviços e informações para enriquecer a base de conhecimento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {knowledge.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{item.type}</Badge>
                  <Badge variant={item.verification_status === "verified" ? "approved" : "secondary"}>
                    {item.verification_status === "verified" ? "Verificado" : "Não verificado"}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
