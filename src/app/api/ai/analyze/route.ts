import { NextResponse } from "next/server"
import { analyzeContentAction } from "@/lib/actions/ai-actions"

export async function POST(request: Request) {
  try {
    const { contentId } = await request.json()

    if (!contentId) {
      return NextResponse.json({ error: "contentId é obrigatório" }, { status: 400 })
    }

    const result = await analyzeContentAction(contentId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    )
  }
}
