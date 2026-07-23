import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfigAutomacoesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Automações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Alertas e Notificações</CardTitle>
          <CardDescription>Configure alertas automáticos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Em breve: alertas de postagem, avaliações, falhas.</p>
        </CardContent>
      </Card>
    </div>
  )
}
