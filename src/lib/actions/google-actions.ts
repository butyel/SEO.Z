"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { generateAuthUrl, getStoredTokens, getConnectionStatus, disconnectGoogle, getClientConnection } from "@/lib/google/oauth"
import { createGoogleProvider } from "@/lib/google/provider"
import { revalidatePath } from "next/cache"

export async function getGoogleAuthUrlAction() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autorizado")

  const status = getConnectionStatus()

  if (!status.enabled) {
    return { error: "Integração Google não está habilitada. Configure GOOGLE_INTEGRATION_ENABLED=true nas variáveis de ambiente." }
  }

  if (!status.hasClientId) {
    return { error: "GOOGLE_CLIENT_ID não configurado. Configure no painel da Vercel." }
  }

  try {
    const url = generateAuthUrl(user.id)
    return { url }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao gerar URL de autenticação" }
  }
}

export async function getGoogleConnectionAction() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return getClientConnection(user.id)
}

export async function getGoogleLocationsAction() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autorizado")

  const tokens = await getStoredTokens(user.id)
  if (!tokens) return { error: "Google não conectado" }

  try {
    const provider = createGoogleProvider()
    const accounts = await provider.getAccounts(tokens.accessToken)

    if (accounts.length === 0) return { locations: [] }

    const allLocations = []
    for (const account of accounts) {
      const locations = await provider.getLocations(tokens.accessToken, account.id)
      allLocations.push(...locations.map(l => ({ ...l, accountName: account.accountName })))
    }

    return { locations: allLocations }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao buscar locais do Google" }
  }
}

export async function getGoogleReviewsAction(locationName: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autorizado")

  const tokens = await getStoredTokens(user.id)
  if (!tokens) return { error: "Google não conectado" }

  try {
    const provider = createGoogleProvider()
    const reviews = await provider.listReviews(tokens.accessToken, locationName)
    return { reviews }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao buscar avaliações" }
  }
}

export async function replyToReviewAction(reviewName: string, comment: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autorizado")

  const tokens = await getStoredTokens(user.id)
  if (!tokens) return { error: "Google não conectado" }

  try {
    const provider = createGoogleProvider()
    await provider.replyToReview(tokens.accessToken, reviewName, comment)
    revalidatePath("/avaliacoes")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao responder avaliação" }
  }
}

export async function getGoogleMetricsAction(locationName: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autorizado")

  const tokens = await getStoredTokens(user.id)
  if (!tokens) return { error: "Google não conectado" }

  try {
    const provider = createGoogleProvider()
    const metrics = await provider.getMetrics(tokens.accessToken, locationName)
    return { metrics }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao buscar métricas" }
  }
}

export async function disconnectGoogleAction() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autorizado")

  await disconnectGoogle(user.id)
  revalidatePath("/configuracoes/google")
  revalidatePath("/configuracoes")
  return { success: true }
}

export async function getGoogleIntegrationStatusAction() {
  const status = getConnectionStatus()
  return status
}
