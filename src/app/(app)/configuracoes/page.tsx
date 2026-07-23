import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Shield, Brain, Globe, Zap } from "lucide-react"
import Link from "next/link"

const settingsItems = [
  { title: "Geral", description: "Configurações básicas da aplicação", href: "/configuracoes/geral", icon: Settings },
  { title: "Inteligência Artificial", description: "Provedor, modelo e prompts", href: "/configuracoes/ia", icon: Brain },
  { title: "Google", description: "Integração com Google Business Profile", href: "/configuracoes/google", icon: Globe },
  { title: "Automações", description: "Alertas e notificações", href: "/configuracoes/automacoes", icon: Zap },
  { title: "Segurança", description: "Logs e auditoria", href: "/configuracoes/seguranca", icon: Shield },
]

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Card className="h-full transition-colors hover:bg-accent/50 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
