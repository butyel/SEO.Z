import { Card, CardContent } from "@/components/ui/card"
import { SearchCheck } from "lucide-react"

export default function AuditoriasPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Auditorias</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <SearchCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Nenhuma auditoria realizada</p>
          <p className="text-sm text-muted-foreground">As auditorias aparecerão aqui após serem executadas.</p>
        </CardContent>
      </Card>
    </div>
  )
}
