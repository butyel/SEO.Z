import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfigSegurancaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Segurança</h1>
      <Card>
        <CardHeader>
          <CardTitle>Logs e Auditoria</CardTitle>
          <CardDescription>Visualize logs de atividades e eventos de segurança</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Em breve: logs de acesso e atividades.</p>
        </CardContent>
      </Card>
    </div>
  )
}
