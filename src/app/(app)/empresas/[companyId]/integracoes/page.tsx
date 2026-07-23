"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink, MapPin, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface GoogleLocation {
  id: string
  locationName: string
  accountName?: string
  primaryPhone: string | null
  websiteUrl: string | null
  primaryCategory: string | null
  address: {
    addressLines: string[]
    locality: string
    administrativeArea: string
  }
}

export default function IntegracoesPage() {
  const [connection, setConnection] = useState<{ status: string; email: string | null } | null>(null)
  const [locations, setLocations] = useState<GoogleLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [connRes, locRes] = await Promise.all([
        fetch("/api/google/connection"),
        fetch("/api/google/locations"),
      ])
      const connData = await connRes.json()
      const locData = await locRes.json()
      setConnection(connData)
      if (locData.error) {
        setError(locData.error)
      }
      if (locData.locations) setLocations(locData.locations)
    } catch {
      setError("Erro ao carregar dados do Google")
    } finally {
      setLoading(false)
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
      <h1 className="text-2xl font-bold tracking-tight">Integrações</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Business Profile</CardTitle>
              <CardDescription>
                {isConnected
                  ? `${locations.length} unidade(s) conectada(s)`
                  : "Gerencie a integração com o Google"}
              </CardDescription>
            </div>
            {isConnected ? (
              <Badge variant="approved">Conectado</Badge>
            ) : (
              <Badge variant="secondary">Desconectado</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Conecte sua conta do Google para gerenciar este perfil diretamente.
              </p>
              <Button asChild>
                <a href="/api/google/auth">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Conectar Google
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-700">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">API do Google ainda sem acesso</p>
                    <p className="mt-1">{error}</p>
                    <p className="mt-2">
                      Solicite acesso em:{" "}
                      <Link
                        href="https://support.google.com/business/contact/api_default"
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        support.google.com/business/contact/api_default
                      </Link>
                    </p>
                  </div>
                </div>
              )}
              {locations.length === 0 && !error ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma unidade encontrada no Google Business Profile.
                </p>
              ) : (
                locations.map((loc) => (
                  <div key={loc.id} className="rounded-md border p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{loc.locationName}</p>
                        <p className="text-sm text-muted-foreground">
                          {loc.address.addressLines.join(", ")}, {loc.address.locality} -{" "}
                          {loc.address.administrativeArea}
                        </p>
                        {loc.primaryCategory && (
                          <Badge variant="outline" className="mt-2">
                            {loc.primaryCategory}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
