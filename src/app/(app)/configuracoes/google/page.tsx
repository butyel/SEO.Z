"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, Unlink, Info } from "lucide-react"
import Link from "next/link"

interface Connection {
  id: string
  email: string | null
  status: string
  created_at: string
  updated_at: string
}

interface IntegrationStatus {
  enabled: boolean
  hasClientId: boolean
  hasClientSecret: boolean
  hasEncryptionKey: boolean
}

export default function ConfigGooglePage() {
  const [connection, setConnection] = useState<Connection | null>(null)
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get("error")
    const successParam = params.get("success")

    if (errorParam) setMessage({ type: "error", text: errorParam })
    if (successParam) setMessage({ type: "success", text: successParam })

    loadData()
  }, [])

  async function loadData() {
    try {
      const [connRes, statusRes] = await Promise.all([
        fetch("/api/google/connection"),
        fetch("/api/google/status"),
      ])
      const connData = await connRes.json()
      const statusData = await statusRes.json()
      setConnection(connData)
      setStatus(statusData)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect() {
    if (!confirm("Tem certeza que deseja desconectar o Google?")) return

    try {
      const res = await fetch("/api/google/disconnect", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setConnection(null)
        setMessage({ type: "success", text: "Desconectado com sucesso" })
      }
    } catch {
      setMessage({ type: "error", text: "Erro ao desconectar" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isConnected = connection?.status === "connected"

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Integração Google</h1>

      {message && (
        <div className={`flex items-start gap-2 rounded-md p-3 text-sm ${
          message.type === "error" ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-700"
        }`}>
          {message.type === "error" ? (
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Conexão Google Business Profile</CardTitle>
              <CardDescription>
                {isConnected
                  ? "Conectado e funcionando"
                  : "Conecte sua conta do Google para gerenciar perfis, postagens, avaliações e métricas"}
              </CardDescription>
            </div>
            {isConnected ? (
              <Badge variant="approved">Conectado</Badge>
            ) : (
              <Badge variant="secondary">Desconectado</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Email:</span>{" "}
                {connection?.email || "Não informado"}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Conectado desde:</span>{" "}
                {connection?.created_at
                  ? new Date(connection.created_at).toLocaleDateString("pt-BR")
                  : "N/A"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {status && !status.enabled && (
                <div className="flex items-start gap-2 rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-700">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Integração desabilitada</p>
                    <p className="text-muted-foreground mt-1">
                      Configure GOOGLE_INTEGRATION_ENABLED=true no Vercel.
                    </p>
                  </div>
                </div>
              )}

              {status && !status.hasClientId && (
                <div className="flex items-start gap-2 rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-700">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Google Client ID não configurado</p>
                    <p className="text-muted-foreground mt-1">
                      Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no Vercel.
                    </p>
                  </div>
                </div>
              )}

              {status && !status.hasEncryptionKey && (
                <div className="flex items-start gap-2 rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-700">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Chave de criptografia ausente</p>
                    <p className="text-muted-foreground mt-1">
                      Configure TOKEN_ENCRYPTION_KEY no Vercel.
                    </p>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                O modo mock está ativo — use dados simulados para testar a interface.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          {isConnected ? (
            <Button variant="destructive" onClick={handleDisconnect}>
              <Unlink className="h-4 w-4 mr-2" />
              Desconectar
            </Button>
          ) : (
            <Button asChild disabled={!status?.hasClientId || !status?.enabled}>
              <a href="/api/google/auth">
                <ExternalLink className="h-4 w-4 mr-2" />
                Conectar Google
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>

      {status && !status.hasClientId && (
        <Card>
          <CardHeader>
            <CardTitle>Pré-requisitos</CardTitle>
            <CardDescription>Passos para configurar a integração com Google</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium">1. Criar projeto no Google Cloud</p>
              <p className="text-muted-foreground mt-1">
                Acesse{" "}
                <Link
                  href="https://console.cloud.google.com"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Google Cloud Console
                </Link>{" "}
                e crie um novo projeto.
              </p>
            </div>
            <div>
              <p className="font-medium">2. Habilitar a API</p>
              <p className="text-muted-foreground mt-1">
                Habilite a "Google Business Profile API" em APIs & Serviços &gt; Biblioteca.
              </p>
            </div>
            <div>
              <p className="font-medium">3. Criar credenciais OAuth</p>
              <p className="text-muted-foreground mt-1">
                Em APIs & Serviços &gt; Credenciais, crie um ID de cliente OAuth 2.0 (tipo: Aplicativo Web).
                Adicione a URI de redirecionamento:{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  {process.env.NEXT_PUBLIC_APP_URL || "https://localops-seo.vercel.app"}/api/google/callback
                </code>
              </p>
            </div>
            <div>
              <p className="font-medium">4. Configurar no Vercel</p>
              <p className="text-muted-foreground mt-1">
                Adicione GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, TOKEN_ENCRYPTION_KEY e GOOGLE_INTEGRATION_ENABLED=true
                nas variáveis de ambiente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
