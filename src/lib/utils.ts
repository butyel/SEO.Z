import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, format: "short" | "long" | "relative" = "short"): string {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  if (format === "relative") {
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return "Hoje"
    if (days === 1) return "Ontem"
    if (days < 7) return `${days} dias atrás`
    if (days < 30) return `${Math.floor(days / 7)} semanas atrás`
    return d.toLocaleDateString("pt-BR")
  }
  return d.toLocaleDateString("pt-BR", format === "long" 
    ? { day: "numeric", month: "long", year: "numeric" } 
    : { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}
