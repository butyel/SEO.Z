import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export default function AvaliacoesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Avaliações</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Star className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Nenhuma avaliação sincronizada</p>
          <p className="text-sm text-muted-foreground">As avaliações aparecerão após a sincronização com o Google.</p>
        </CardContent>
      </Card>
    </div>
  )
}
