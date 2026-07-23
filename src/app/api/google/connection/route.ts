import { NextResponse } from "next/server"
import { getGoogleConnectionAction } from "@/lib/actions/google-actions"

export async function GET() {
  try {
    const result = await getGoogleConnectionAction()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(null)
  }
}
