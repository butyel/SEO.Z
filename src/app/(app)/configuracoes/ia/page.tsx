import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfigIAPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Configurações de IA</h1>
      <Card>
        <CardHeader>
          <CardTitle>Provedor de IA</CardTitle>
          <CardDescription>Configure o provedor e modelo de IA</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Em breve: provedor, modelo, temperatura, prompts.</p>
        </CardContent>
      </Card>
    </div>
  )
}
