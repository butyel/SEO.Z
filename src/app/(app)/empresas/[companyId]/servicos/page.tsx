import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase } from "lucide-react"

interface PageProps {
  params: Promise<{ companyId: string }>
}

export default async function ServicosPage({ params }: PageProps) {
  const { companyId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("company_id", companyId)
    .neq("status", "archived")
    .order("internal_name")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>

      {!services || services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhum serviço cadastrado</p>
            <p className="text-sm text-muted-foreground">Cadastre os serviços oferecidos por esta empresa.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={
                    service.status === "approved" ? "approved" :
                    service.status === "synced" ? "published" :
                    service.status === "draft" ? "draft" : "secondary"
                  }>
                    {service.status === "approved" ? "Aprovado" :
                     service.status === "synced" ? "Sincronizado" :
                     service.status === "draft" ? "Rascunho" :
                     service.status === "manually_added" ? "Manual" : service.status}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">{service.internal_name}</CardTitle>
              </CardHeader>
              <CardContent>
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                )}
                {service.price != null && (
                  <p className="text-sm font-medium mt-2">
                    {service.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
