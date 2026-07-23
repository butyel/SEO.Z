import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Building2 } from "lucide-react"
import Link from "next/link"

async function getCompanies() {
  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server")
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from("companies")
      .select("id, name, main_city, state, segment, status, slug")
      .eq("status", "active")
      .order("name")
    return data || []
  } catch {
    return []
  }
}

export default async function EmpresasPage() {
  const companies = await getCompanies()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">Gerencie suas empresas e unidades</p>
        </div>
        <Button asChild>
          <Link href="/empresas/nova">
            <Plus className="h-4 w-4" />
            Nova Empresa
          </Link>
        </Button>
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhuma empresa cadastrada</p>
            <p className="text-sm text-muted-foreground mb-4">
              Crie sua primeira empresa para começar a gerenciar seu SEO Local
            </p>
            <Button asChild>
              <Link href="/empresas/nova">
                <Plus className="h-4 w-4" />
                Nova Empresa
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link key={company.id} href={`/empresas/${company.id}`}>
              <Card className="h-full transition-colors hover:bg-accent/50 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {company.name}
                  </CardTitle>
                  <CardDescription>
                    {company.main_city}{company.main_city && company.state ? ", " : ""}{company.state}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {company.segment && (
                    <Badge variant="secondary">{company.segment}</Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
