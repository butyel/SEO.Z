"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ConfigGooglePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Integração Google</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Conexão Google Business Profile</CardTitle>
              <CardDescription>Gerencie a integração com o Google</CardDescription>
            </div>
            <Badge variant="secondary">Desconectado</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Conecte sua conta do Google para gerenciar perfis da empresa, postagens, avaliações e métricas.
          </p>
          <Button disabled>Conectar Google</Button>
        </CardContent>
      </Card>
    </div>
  )
}
