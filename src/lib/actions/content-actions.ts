"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createContentSchema = z.object({
  company_id: z.string().uuid(),
  location_id: z.string().uuid().nullable().optional(),
  type: z.enum(["google_update", "google_cta", "offer", "event", "service_description", "qa", "review_response", "blog", "instagram", "service_page", "local_page", "faq", "announcement", "seasonal", "social_proof", "behind_scenes", "alert", "b2b"]),
  title: z.string().min(2, "Título deve ter no mínimo 2 caracteres"),
  theme: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  service_id: z.string().uuid().nullable().optional(),
  main_keyword: z.string().nullable().optional(),
  search_intent: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  target_audience: z.string().nullable().optional(),
  objective: z.string().nullable().optional(),
  cta: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
})

export async function createContent(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autorizado")

  const raw: Record<string, unknown> = {}
  formData.forEach((value, key) => { raw[key] = value })

  const parsed = createContentSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues.map(i => i.message).join(", ") }
  }

  const { error } = await supabase.from("content_items").insert({
    owner_id: user.id,
    ...parsed.data,
    status: "draft",
  })

  if (error) return { error: error.message }

  revalidatePath("/conteudos")
  return { success: true }
}

export async function updateContentStatus(
  contentId: string,
  status: string,
  options?: { score?: number; scoreOverride?: boolean; scoreOverrideReason?: string }
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autorizado")

  const update: Record<string, unknown> = { status }

  if (options?.score != null) update.score = options.score
  if (options?.scoreOverride) {
    update.score_override = true
    update.score_override_reason = options.scoreOverrideReason || "Override manual"
    update.score_override_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from("content_items")
    .update(update)
    .eq("id", contentId)
    .eq("owner_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/conteudos")
  revalidatePath(`/conteudos/${contentId}`)
  return { success: true }
}

export async function saveContentDraft(
  contentId: string,
  content: string
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autorizado")

  const { data: current } = await supabase
    .from("content_items")
    .select("version")
    .eq("id", contentId)
    .single()

  const newVersion = (current?.version || 0) + 1

  const { error: versionError } = await supabase.from("content_versions").insert({
    content_id: contentId,
    owner_id: user.id,
    version: newVersion,
    content,
  })

  if (versionError) return { error: versionError.message }

  const { error } = await supabase
    .from("content_items")
    .update({ content, version: newVersion })
    .eq("id", contentId)
    .eq("owner_id", user.id)

  if (error) return { error: error.message }

  revalidatePath(`/conteudos/${contentId}`)
  return { success: true, version: newVersion }
}
