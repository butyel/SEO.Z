import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone } from "lucide-react"

interface PageProps {
  params: Promise<{ companyId: string }>
}

export default async function UnidadesPage({ params }: PageProps) {
  const { companyId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: locations } = await supabase
    .from("company_locations")
    .select("*")
    .eq("company_id", companyId)
    .order("name")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Unidades</h1>

      {!locations || locations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhuma unidade cadastrada</p>
            <p className="text-sm text-muted-foreground">Adicione as unidades físicas ou áreas de atendimento desta empresa.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {locations.map((location) => (
            <Card key={location.id}>
              <CardHeader>
                <CardTitle className="text-base">{location.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {location.city}, {location.state}
                  {location.address ? ` - ${location.address}` : ""}
                </div>
                {location.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    {location.phone}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
