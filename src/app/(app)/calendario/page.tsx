import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default function CalendarioPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Calendário</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Nenhum conteúdo programado</p>
          <p className="text-sm text-muted-foreground">O calendário editorial aparecerá aqui.</p>
        </CardContent>
      </Card>
    </div>
  )
}
