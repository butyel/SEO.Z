import { NextResponse } from "next/server"
import { getGoogleLocationsAction } from "@/lib/actions/google-actions"

export async function GET() {
  try {
    const result = await getGoogleLocationsAction()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao buscar locais" }, { status: 500 })
  }
}
