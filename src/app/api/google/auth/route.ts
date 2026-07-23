import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { generateAuthUrl } from "@/lib/google/oauth"

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(
        new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
      )
    }

    const isEnabled = process.env.GOOGLE_INTEGRATION_ENABLED === "true"

    if (!isEnabled) {
      return NextResponse.redirect(
        new URL("/configuracoes/google?error=Integração+Google+desabilitada", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
      )
    }

    const url = generateAuthUrl(user.id)
    return NextResponse.redirect(url)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Erro desconhecido"
    return NextResponse.redirect(
      new URL("/configuracoes/google?error=" + encodeURIComponent(errorMsg), process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    )
  }
}
