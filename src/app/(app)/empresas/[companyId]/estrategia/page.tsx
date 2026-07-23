import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PageProps {
  params: Promise<{ companyId: string }>
}

export default async function EstrategiaPage({ params }: PageProps) {
  const { companyId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single()

  if (!company) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Estratégia</h1>
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral da Estratégia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Section label="Público-alvo" value={company.target_audience} />
          <Section label="Persona" value={company.persona} />
          <Section label="Diferenciais" value={company.differentiators?.join(", ")} />
          <Section label="Concorrentes" value={company.competitors?.join(", ")} />
          <Section label="Objetivo do Projeto" value={company.project_objective} />
          <Section label="Tom de Voz" value={company.voice_tone} />
          <Section label="CTA Padrão" value={company.default_cta} />
        </CardContent>
      </Card>
    </div>
  )
}

function Section({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}
