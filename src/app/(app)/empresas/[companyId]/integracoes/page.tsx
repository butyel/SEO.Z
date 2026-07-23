import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PageProps {
  params: Promise<{ companyId: string }>
}

export default async function IntegracoesPage({ params }: PageProps) {
  const { companyId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, google_business_url")
    .eq("id", companyId)
    .single()

  if (!company) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Integrações</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Business Profile</CardTitle>
              <CardDescription>Gerencie a integração com o Google</CardDescription>
            </div>
            <Badge variant="secondary">Desconectado</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Conecte sua conta do Google para gerenciar este perfil diretamente.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
