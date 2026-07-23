import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Image } from "lucide-react"

interface PageProps {
  params: Promise<{ companyId: string }>
}

export default async function MidiasPage({ params }: PageProps) {
  const { companyId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: media } = await supabase
    .from("media_assets")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Mídias</h1>

      {!media || media.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Image className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhuma mídia cadastrada</p>
            <p className="text-sm text-muted-foreground">Faça upload de imagens e mídias para sua biblioteca.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {media.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="p-4">
                <div className="aspect-video rounded-md bg-muted flex items-center justify-center mb-2">
                  {asset.mime_type?.startsWith("image/") ? (
                    <img src={asset.public_url || ""} alt={asset.alt_text || ""} className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <Image className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm font-medium truncate">{asset.file_name}</p>
                {asset.category && <p className="text-xs text-muted-foreground">{asset.category}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
