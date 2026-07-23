import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfigGeralPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Configurações Gerais</h1>
      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
          <CardDescription>Configure as preferências da aplicação</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Em breve: fuso horário, tema, idioma.</p>
        </CardContent>
      </Card>
    </div>
  )
}
