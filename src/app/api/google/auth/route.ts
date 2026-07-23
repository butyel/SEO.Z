import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { generateAuthUrl } from "@/lib/google/oauth"

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const isEnabled = process.env.GOOGLE_INTEGRATION_ENABLED === "true"

    if (!isEnabled) {
      return NextResponse.json({ error: "Integração Google desabilitada. Configure GOOGLE_INTEGRATION_ENABLED=true." })
    }

    const url = generateAuthUrl(user.id)
    return NextResponse.json({ url })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao gerar URL de autenticação" },
      { status: 500 }
    )
  }
}
