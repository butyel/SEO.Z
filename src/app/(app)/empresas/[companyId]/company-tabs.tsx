"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, usePathname } from "next/navigation"

interface CompanyTabsProps {
  companyId: string
}

const tabs = [
  { value: "visao-geral", label: "Visão Geral", href: "" },
  { value: "estrategia", label: "Estratégia", href: "/estrategia" },
  { value: "unidades", label: "Unidades", href: "/unidades" },
  { value: "servicos", label: "Serviços", href: "/servicos" },
  { value: "regras", label: "Regras", href: "/regras" },
  { value: "conhecimento", label: "Conhecimento", href: "/conhecimento" },
  { value: "palavras-chave", label: "Palavras-chave", href: "/palavras-chave" },
  { value: "midias", label: "Mídias", href: "/midias" },
  { value: "auditorias", label: "Auditorias", href: "/auditorias" },
  { value: "integracoes", label: "Integrações", href: "/integracoes" },
]

export function CompanyTabs({ companyId }: CompanyTabsProps) {
  const router = useRouter()
  const pathname = usePathname()

  const currentTab = tabs.find((t) => pathname === `/empresas/${companyId}${t.href}` || (t.href === "" && pathname === `/empresas/${companyId}`))

  return (
    <Tabs
      value={currentTab?.value || "visao-geral"}
      onValueChange={(value) => {
        const tab = tabs.find((t) => t.value === value)
        if (tab) {
          router.push(`/empresas/${companyId}${tab.href}`)
        }
      }}
      className="mt-6"
    >
      <TabsList className="flex-wrap h-auto">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
