import { NextResponse } from "next/server"
import { getGoogleIntegrationStatusAction } from "@/lib/actions/google-actions"

export async function GET() {
  try {
    const result = await getGoogleIntegrationStatusAction()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ enabled: false, hasClientId: false, hasClientSecret: false, hasEncryptionKey: false })
  }
}
