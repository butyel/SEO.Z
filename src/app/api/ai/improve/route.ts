import { NextResponse } from "next/server"
import { improveContentAction } from "@/lib/actions/ai-actions"

export async function POST(request: Request) {
  try {
    const { contentId } = await request.json()

    if (!contentId) {
      return NextResponse.json({ error: "contentId é obrigatório" }, { status: 400 })
    }

    const result = await improveContentAction(contentId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    )
  }
}
