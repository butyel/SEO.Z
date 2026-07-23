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

const contentTypes = [
  { value: "google_update", label: "Postagem de Atualização (Google)" },
  { value: "google_cta", label: "Postagem com CTA (Google)" },
  { value: "offer", label: "Oferta" },
  { value: "event", label: "Evento" },
  { value: "service_description", label: "Descrição de Serviço" },
  { value: "qa", label: "Pergunta e Resposta" },
  { value: "review_response", label: "Resposta para Avaliação" },
  { value: "blog", label: "Artigo de Blog" },
  { value: "faq", label: "FAQ" },
]

export default function NovoConteudoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])
  const [form, setForm] = useState({
    company_id: "",
    title: "",
    type: "google_update" as string,
    theme: "",
    main_keyword: "",
    city: "",
    cta: "",
  })

  useState(() => {
    supabase.from("companies").select("id, name").eq("status", "active").order("name").then(({ data }) => {
      if (data) setCompanies(data)
    })
  })

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { error: insertError } = await supabase.from("content_items").insert({
      owner_id: user.id,
      company_id: form.company_id,
      title: form.title,
      type: form.type,
      theme: form.theme || null,
      main_keyword: form.main_keyword || null,
      city: form.city || null,
      cta: form.cta || null,
      status: "draft",
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push("/conteudos")
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/conteudos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Conteúdo</h1>
          <p className="text-muted-foreground">Crie um novo conteúdo para publicação</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Conteúdo</CardTitle>
          <CardDescription>Defina o tipo e tema do conteúdo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="company_id">Empresa *</Label>
              <select
                id="company_id"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={form.company_id}
                onChange={(e) => handleChange("company_id", e.target.value)}
                required
              >
                <option value="">Selecione uma empresa</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <select
                id="type"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                {contentTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" value={form.title} onChange={(e) => handleChange("title", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Input id="theme" value={form.theme} onChange={(e) => handleChange("theme", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="main_keyword">Palavra-chave principal</Label>
                <Input id="main_keyword" value={form.main_keyword} onChange={(e) => handleChange("main_keyword", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta">CTA</Label>
              <Input id="cta" value={form.cta} onChange={(e) => handleChange("cta", e.target.value)} placeholder="ex: Saiba mais" />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Criando..." : "Criar Conteúdo"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/conteudos">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
