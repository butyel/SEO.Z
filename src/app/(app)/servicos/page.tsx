import { Card, CardContent } from "@/components/ui/card"
import { Briefcase } from "lucide-react"

export default function ServicosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Nenhum serviço cadastrado</p>
          <p className="text-sm text-muted-foreground">Os serviços aparecerão aqui após serem cadastrados.</p>
        </CardContent>
      </Card>
    </div>
  )
}
