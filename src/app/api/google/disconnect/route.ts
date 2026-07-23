import { NextResponse } from "next/server"
import { disconnectGoogleAction } from "@/lib/actions/google-actions"

export async function POST() {
  try {
    const result = await disconnectGoogleAction()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao desconectar" }, { status: 500 })
  }
}
