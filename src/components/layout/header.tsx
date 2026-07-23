"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell, User, LogOut, Settings } from "lucide-react"

interface HeaderProps {
  userEmail?: string
}

export function Header({ userEmail }: HeaderProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [menuOpen])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const initials = userEmail ? userEmail.charAt(0).toUpperCase() : "A"

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar empresas, conteúdos..." className="pl-8 h-9" />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
            3
          </span>
        </Button>

        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            className="h-9 w-9 rounded-full"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {initials}
            </div>
          </Button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[14rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">Administrador</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <div className="h-px bg-muted my-1" />
              <button
                className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={() => { router.push("/configuracoes"); setMenuOpen(false) }}
              >
                <Settings className="h-4 w-4" />
                Configurações
              </button>
              <div className="h-px bg-muted my-1" />
              <button
                className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
