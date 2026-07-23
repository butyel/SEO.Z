import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/client"

const SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
].join(" ")

function getEncryptionKey(): string {
  const key = process.env.TOKEN_ENCRYPTION_KEY
  if (!key) {
    throw new Error("TOKEN_ENCRYPTION_KEY não configurada")
  }
  return key
}

function getClientConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/google/callback`,
  }
}

function isEnabled(): boolean {
  return process.env.GOOGLE_INTEGRATION_ENABLED === "true"
}

export function generateAuthUrl(userId: string): string {
  if (!isEnabled()) {
    throw new Error("Integração Google não está habilitada. Defina GOOGLE_INTEGRATION_ENABLED=true")
  }

  const { clientId, redirectUri } = getClientConfig()

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID não configurado")
  }

  const state = Buffer.from(JSON.stringify({ userId, csrf: Math.random().toString(36).slice(2) })).toString("base64url")

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCode(code: string, state: string): Promise<{ accessToken: string; refreshToken: string | null; expiresAt: number }> {
  const { clientId, clientSecret, redirectUri } = getClientConfig()

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${response.status} ${error}`)
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number }> {
  const { clientId, clientSecret } = getClientConfig()

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${response.status} ${error}`)
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  }
}

function encrypt(text: string): string {
  const key = getEncryptionKey()
  const encoded = Buffer.from(text + ":" + key.slice(0, 16)).toString("base64")
  return encoded.split("").reverse().join("")
}

function decrypt(encrypted: string): string {
  const key = getEncryptionKey()
  const reversed = encrypted.split("").reverse().join("")
  const decoded = Buffer.from(reversed, "base64").toString("utf-8")
  return decoded.replace(`:${key.slice(0, 16)}`, "")
}

export async function storeTokens(
  userId: string,
  accessToken: string,
  refreshToken: string | null,
  expiresAt: number,
  email: string | null
) {
  const supabase = await createServerSupabaseClient()

  const encryptedAccess = encrypt(accessToken)
  const encryptedRefresh = refreshToken ? encrypt(refreshToken) : null

  const { error } = await supabase.from("google_connections").upsert({
    owner_id: userId,
    email,
    access_token_encrypted: encryptedAccess,
    refresh_token_encrypted: encryptedRefresh,
    expires_at: new Date(expiresAt).toISOString(),
    status: "connected",
  }, { onConflict: "owner_id" })

  if (error) throw new Error(`Failed to store tokens: ${error.message}`)
}

export async function getStoredTokens(userId: string): Promise<{ accessToken: string; refreshToken: string | null } | null> {
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from("google_connections")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle()

  if (!data) return null

  let accessToken = decrypt(data.access_token_encrypted)
  const refreshToken = data.refresh_token_encrypted ? decrypt(data.refresh_token_encrypted) : null

  const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : 0

  if (Date.now() >= expiresAt - 300000 && refreshToken) {
    try {
      const refreshed = await refreshAccessToken(refreshToken)
      accessToken = refreshed.accessToken
      await storeTokens(userId, accessToken, refreshToken, refreshed.expiresAt, data.email)
    } catch {
      await disconnectGoogle(userId)
      return null
    }
  }

  return { accessToken, refreshToken }
}

export async function disconnectGoogle(userId: string) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from("google_connections")
    .update({ status: "disconnected" })
    .eq("owner_id", userId)

  if (error) throw new Error(`Failed to disconnect: ${error.message}`)
}

export function getConnectionStatus() {
  return {
    enabled: isEnabled(),
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasEncryptionKey: !!process.env.TOKEN_ENCRYPTION_KEY,
  }
}

export async function getClientConnection(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from("google_connections")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle()

  return data || null
}
