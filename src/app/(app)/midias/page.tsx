import { Card, CardContent } from "@/components/ui/card"
import { Image } from "lucide-react"

export default function MidiasPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Mídias</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Image className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Nenhuma mídia cadastrada</p>
          <p className="text-sm text-muted-foreground">Faça upload de imagens e mídias para organizar sua biblioteca.</p>
        </CardContent>
      </Card>
    </div>
  )
}
