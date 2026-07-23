import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PageProps {
  params: Promise<{ companyId: string }>
}

export default async function RegrasPage({ params }: PageProps) {
  const { companyId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: rules } = await supabase
    .from("company_rules")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Regras de Conteúdo</h1>
      {!rules ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground">Nenhuma regra configurada. As regras padrão serão aplicadas.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Limites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Caracteres máximos: <strong>{rules.max_characters || "Sem limite"}</strong></p>
              <p>Hashtags: <strong>{rules.use_hashtags ? `Sim (max: ${rules.max_hashtags || "sem limite"})` : "Não"}</strong></p>
              <p>Emojis: <strong>{rules.allow_emojis ? `Sim (max: ${rules.max_emojis || "sem limite"})` : "Não"}</strong></p>
              <p>Nota mínima: <strong>{rules.min_score_for_approval}</strong></p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Exigências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>CTA obrigatório: <strong>{rules.require_cta ? "Sim" : "Não"}</strong></p>
              <p>Cidade obrigatória: <strong>{rules.require_city ? "Sim" : "Não"}</strong></p>
              <p>Empresa no texto: <strong>{rules.require_company_name ? "Sim" : "Não"}</strong></p>
              <p>Preço permitido: <strong>{rules.allow_price ? "Sim" : "Não"}</strong></p>
              <p>Promoções: <strong>{rules.allow_promotions ? "Sim" : "Não"}</strong></p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
