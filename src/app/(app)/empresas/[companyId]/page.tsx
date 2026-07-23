import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Globe, Mail, Phone, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CompanyTabs } from "./company-tabs"

interface PageProps {
  params: Promise<{ companyId: string }>
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { companyId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single()

  if (!company) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/empresas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
              <Badge variant={company.status === "active" ? "approved" : "secondary"}>
                {company.status === "active" ? "Ativa" : "Arquivada"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {company.main_city}{company.main_city && company.state ? ", " : ""}{company.state}
              {company.segment ? ` · ${company.segment}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unidades</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {company.description && (
        <Card>
          <CardHeader>
            <CardTitle>Sobre</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{company.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {company.website && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {company.website}
            </a>
          </div>
        )}
        {company.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{company.phone}</span>
          </div>
        )}
        {company.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{company.email}</span>
          </div>
        )}
      </div>

      <CompanyTabs companyId={companyId} />
    </div>
  )
}
