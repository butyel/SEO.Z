import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { exchangeCode, storeTokens } from "@/lib/google/oauth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const state = searchParams.get("state")

    if (error) {
      return NextResponse.redirect(
        new URL("/configuracoes/google?error=Autorização+negada+pelo+Google", process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/configuracoes/google?error=Código+de+autorização+ausente", process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    let userId: string
    try {
      const stateData = JSON.parse(Buffer.from(state, "base64url").toString())
      userId = stateData.userId
    } catch {
      return NextResponse.redirect(
        new URL("/configuracoes/google?error=Estado+inválido", process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.redirect(
        new URL("/login", process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    const tokens = await exchangeCode(code, state)
    const tokenResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })
    const userInfo = await tokenResponse.json().catch(() => ({ email: null }))

    await storeTokens(user.id, tokens.accessToken, tokens.refreshToken, tokens.expiresAt, userInfo.email || null)

    return NextResponse.redirect(
      new URL("/configuracoes/google?success=Conectado+com+sucesso", process.env.NEXT_PUBLIC_APP_URL)
    )
  } catch (error) {
    return NextResponse.redirect(
      new URL("/configuracoes/google?error=" + encodeURIComponent(error instanceof Error ? error.message : "Erro ao processar callback"), process.env.NEXT_PUBLIC_APP_URL)
    )
  }
}
