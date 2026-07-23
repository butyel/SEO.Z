export interface Company {
  id: string
  owner_id: string
  name: string
  trade_name: string | null
  slug: string
  segment: string | null
  description: string | null
  status: "active" | "archived"
  logo_url: string | null
  website: string | null
  whatsapp: string | null
  phone: string | null
  email: string | null
  instagram: string | null
  facebook: string | null
  google_business_url: string | null
  main_city: string | null
  state: string | null
  country: string | null
  service_regions: string[] | null
  neighborhoods: string[] | null
  business_type: "physical" | "service_area" | "hybrid" | null
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface CompanyLocation {
  id: string
  company_id: string
  owner_id: string
  name: string
  city: string
  state: string
  address: string | null
  zip_code: string | null
  phone: string | null
  whatsapp: string | null
  website: string | null
  hours: Record<string, string> | null
  special_hours: Record<string, string> | null
  service_area: string | null
  latitude: number | null
  longitude: number | null
  google_location_id: string | null
  google_account_id: string | null
  sync_status: "not_synced" | "synced" | "error"
  last_sync_at: string | null
  main_category: string | null
  secondary_categories: string[] | null
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface CompanyRule {
  id: string
  company_id: string
  owner_id: string
  max_characters: number | null
  max_google_characters: number | null
  use_hashtags: boolean
  max_hashtags: number | null
  allow_emojis: boolean
  max_emojis: number | null
  use_dashes: boolean
  use_lists: boolean
  require_cta: boolean
  default_cta: string | null
  require_city: boolean
  require_company_name: boolean
  keyword_in_first_paragraph: boolean
  allow_price: boolean
  require_approval_for_price: boolean
  allow_promotions: boolean
  require_sources: boolean
  require_faq: boolean
  require_objective_answer: boolean
  formality_level: "formal" | "neutral" | "casual" | null
  voice_tone: string | null
  forbidden_terms: string[] | null
  required_terms: string[] | null
  approved_expressions: string[] | null
  rejected_expressions: string[] | null
  never_invent: string[] | null
  min_score_for_approval: number
  editorial_frequency: string | null
  min_interval_between_themes: number | null
  created_at: string
  updated_at: string
}

export interface KnowledgeBase {
  id: string
  company_id: string
  owner_id: string
  location_id: string | null
  type: "fact" | "service" | "differential" | "history" | "certification" | "warranty" | "professional" | "location" | "city" | "faq" | "policy" | "product" | "link" | "source" | "approved_text" | "rejected_text" | "rule" | "observation"
  title: string
  content: string
  source: string | null
  source_url: string | null
  verification_status: "verified" | "unverified" | "outdated" | "archived"
  verified_at: string | null
  expires_at: string | null
  priority: "low" | "medium" | "high"
  ai_usable: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Keyword {
  id: string
  company_id: string
  owner_id: string
  keyword: string
  secondary_keywords: string[] | null
  local_variations: string[] | null
  questions: string[] | null
  commercial_terms: string[] | null
  pain_terms: string[] | null
  solution_terms: string[] | null
  comparison_terms: string[] | null
  urgency_terms: string[] | null
  related_entities: string[] | null
  cluster: string | null
  pillar_page: string | null
  intent: "informational" | "commercial" | "transactional" | "navigational" | "local"
  city: string | null
  service: string | null
  priority: "low" | "medium" | "high"
  volume: number | null
  difficulty: number | null
  research_source: string | null
  researched_at: string | null
  status: "active" | "archived"
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  company_id: string
  owner_id: string
  location_id: string | null
  internal_name: string
  google_name: string | null
  description: string | null
  category: string | null
  main_keyword: string | null
  secondary_keywords: string[] | null
  city: string | null
  target_audience: string | null
  benefits: string[] | null
  differentials: string[] | null
  cta: string | null
  price: number | null
  show_price: boolean
  status: "draft" | "review" | "approved" | "manually_added" | "synced" | "sync_not_supported" | "failed" | "archived"
  sync_status: string | null
  external_id: string | null
  last_sync_at: string | null
  sync_error: string | null
  last_reviewed_at: string | null
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface ContentItem {
  id: string
  company_id: string
  owner_id: string
  location_id: string | null
  type: "google_update" | "google_cta" | "offer" | "event" | "service_description" | "qa" | "review_response" | "blog" | "instagram" | "service_page" | "local_page" | "faq" | "announcement" | "seasonal" | "social_proof" | "behind_scenes" | "alert" | "b2b"
  title: string
  theme: string | null
  content: string | null
  service_id: string | null
  main_keyword: string | null
  secondary_keywords: string[] | null
  search_intent: string | null
  city: string | null
  target_audience: string | null
  objective: string | null
  cta: string | null
  link: string | null
  scheduled_at: string | null
  published_at: string | null
  published_manually: boolean
  external_url: string | null
  external_id: string | null
  status: "idea" | "draft" | "generating" | "review" | "needs_adjustments" | "approved" | "scheduled" | "publishing" | "published" | "failed" | "cancelled" | "archived"
  score: number | null
  score_override: boolean
  score_override_reason: string | null
  score_override_at: string | null
  version: number
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface ContentVersion {
  id: string
  content_id: string
  owner_id: string
  version: number
  content: string
  score: number | null
  score_details: Record<string, unknown> | null
  rule_results: Record<string, unknown> | null
  ai_model: string | null
  prompt_version: string | null
  token_usage: Record<string, unknown> | null
  generation_time_ms: number | null
  created_at: string
}

export interface MediaAsset {
  id: string
  company_id: string
  owner_id: string
  location_id: string | null
  file_name: string
  alt_text: string | null
  caption: string | null
  dimensions: string | null
  mime_type: string | null
  file_size: number | null
  category: string | null
  tags: string[] | null
  origin: string | null
  usage_authorized: boolean
  ai_usable: boolean
  publishable: boolean
  storage_path: string
  public_url: string | null
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface Review {
  id: string
  company_id: string
  owner_id: string
  location_id: string | null
  external_id: string | null
  author: string | null
  rating: number
  text: string | null
  review_date: string | null
  updated_at: string | null
  current_response: string | null
  response_status: "none" | "suggestion_generated" | "awaiting_review" | "approved" | "responded_manually" | "responded_via_api" | "failed" | "archived"
  sentiment: "positive" | "neutral" | "negative" | null
  mentioned_service: string | null
  relevant_phrase: string | null
  urgency: "low" | "medium" | "high" | null
  source: string | null
  last_sync_at: string | null
  moderation_state: string | null
  created_at: string
}

export interface GoogleConnection {
  id: string
  owner_id: string
  email: string | null
  access_token_encrypted: string | null
  refresh_token_encrypted: string | null
  expires_at: string | null
  scope: string[] | null
  status: "connected" | "expired" | "disconnected" | "error"
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

export interface GoogleLocation {
  id: string
  connection_id: string
  owner_id: string
  google_account_id: string
  google_location_id: string
  location_name: string
  location_address: string | null
  location_phone: string | null
  primary_category: string | null
  additional_categories: string[] | null
  location_state: string | null
  internal_location_id: string | null
  sync_status: "not_synced" | "synced" | "error"
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

export interface PublishingJob {
  id: string
  owner_id: string
  company_id: string
  location_id: string | null
  content_id: string
  type: string
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  scheduled_at: string | null
  attempts: number
  max_attempts: number
  next_attempt_at: string | null
  idempotency_key: string
  external_response: Record<string, unknown> | null
  error_code: string | null
  error_message: string | null
  created_at: string
  processed_at: string | null
}

export interface ActivityLog {
  id: string
  owner_id: string
  company_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  created_at: string
}
