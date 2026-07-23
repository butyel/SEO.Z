import { Card, CardContent } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Nenhum relatório gerado</p>
          <p className="text-sm text-muted-foreground">Os relatórios aparecerão aqui após a coleta de dados.</p>
        </CardContent>
      </Card>
    </div>
  )
}
