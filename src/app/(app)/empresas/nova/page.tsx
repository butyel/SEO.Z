"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { z } from "zod"

const companySchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  trade_name: z.string().optional(),
  segment: z.string().optional(),
  description: z.string().optional(),
  main_city: z.string().optional(),
  state: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
})

export default function NovaEmpresaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: "",
    trade_name: "",
    segment: "",
    description: "",
    main_city: "",
    state: "",
    website: "",
    phone: "",
    email: "",
  })

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const result = companySchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const slug = form.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 100)

    const { data, error } = await supabase
      .from("companies")
      .insert({
        owner_id: user.id,
        name: form.name,
        trade_name: form.trade_name || null,
        slug,
        segment: form.segment || null,
        description: form.description || null,
        main_city: form.main_city || null,
        state: form.state || null,
        website: form.website || null,
        phone: form.phone || null,
        email: form.email || null,
      })
      .select()
      .single()

    if (error) {
      setErrors({ form: error.message })
      setLoading(false)
      return
    }

    router.push(`/empresas/${data.id}`)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/empresas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Empresa</h1>
          <p className="text-muted-foreground">Cadastre uma nova empresa para gerenciar seu SEO Local</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>Preencha os dados básicos da empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {errors.form}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome oficial *</Label>
              <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade_name">Nome comercial</Label>
              <Input id="trade_name" value={form.trade_name} onChange={(e) => handleChange("trade_name", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="segment">Segmento</Label>
                <Input id="segment" value={form.segment} onChange={(e) => handleChange("segment", e.target.value)} placeholder="ex: Autopeças" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" value={form.state} onChange={(e) => handleChange("state", e.target.value)} placeholder="SP" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="main_city">Cidade principal</Label>
              <Input id="main_city" value={form.main_city} onChange={(e) => handleChange("main_city", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site</Label>
              <Input id="website" type="url" value={form.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://" />
              {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Salvando..." : "Salvar Empresa"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/empresas">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
