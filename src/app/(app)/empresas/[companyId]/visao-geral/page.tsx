import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Phone, Mail, MapPin, Building2 } from "lucide-react"

interface PageProps {
  params: Promise<{ companyId: string }>
}

export default async function VisaoGeralPage({ params }: PageProps) {
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
      <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{company.name}</span>
              <Badge variant={company.status === "active" ? "approved" : "secondary"}>
                {company.status === "active" ? "Ativa" : "Arquivada"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {company.main_city || "Cidade não informada"}
              {company.state ? `, ${company.state}` : ""}
            </div>
            {company.segment && (
              <Badge variant="secondary">{company.segment}</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {company.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                  {company.website}
                </a>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{company.phone}</span>
              </div>
            )}
            {company.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{company.email}</span>
              </div>
            )}
            {!company.website && !company.phone && !company.email && (
              <p className="text-sm text-muted-foreground">Nenhuma informação de contato cadastrada.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {company.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{company.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
