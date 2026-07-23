-- Initial Schema for LocalOps SEO
-- This migration creates all tables, enums, indexes, RLS policies, and triggers.

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE company_status AS ENUM ('active', 'archived');
CREATE TYPE business_type AS ENUM ('physical', 'service_area', 'hybrid');
CREATE TYPE location_sync_status AS ENUM ('not_synced', 'synced', 'error');
CREATE TYPE knowledge_type AS ENUM ('fact', 'service', 'differential', 'history', 'certification', 'warranty', 'professional', 'location', 'city', 'faq', 'policy', 'product', 'link', 'source', 'approved_text', 'rejected_text', 'rule', 'observation');
CREATE TYPE verification_status AS ENUM ('verified', 'unverified', 'outdated', 'archived');
CREATE TYPE knowledge_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE keyword_intent AS ENUM ('informational', 'commercial', 'transactional', 'navigational', 'local');
CREATE TYPE keyword_status AS ENUM ('active', 'archived');
CREATE TYPE service_status AS ENUM ('draft', 'review', 'approved', 'manually_added', 'synced', 'sync_not_supported', 'failed', 'archived');
CREATE TYPE content_type AS ENUM ('google_update', 'google_cta', 'offer', 'event', 'service_description', 'qa', 'review_response', 'blog', 'instagram', 'service_page', 'local_page', 'faq', 'announcement', 'seasonal', 'social_proof', 'behind_scenes', 'alert', 'b2b');
CREATE TYPE content_status AS ENUM ('idea', 'draft', 'generating', 'review', 'needs_adjustments', 'approved', 'scheduled', 'publishing', 'published', 'failed', 'cancelled', 'archived');
CREATE TYPE review_response_status AS ENUM ('none', 'suggestion_generated', 'awaiting_review', 'approved', 'responded_manually', 'responded_via_api', 'failed', 'archived');
CREATE TYPE review_sentiment AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE review_urgency AS ENUM ('low', 'medium', 'high');
CREATE TYPE google_connection_status AS ENUM ('connected', 'expired', 'disconnected', 'error');
CREATE TYPE google_sync_status AS ENUM ('not_synced', 'synced', 'error');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- HELPER: updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trade_name TEXT,
  slug TEXT NOT NULL,
  segment TEXT,
  description TEXT,
  status company_status DEFAULT 'active',
  logo_url TEXT,
  website TEXT,
  whatsapp TEXT,
  phone TEXT,
  email TEXT,
  instagram TEXT,
  facebook TEXT,
  google_business_url TEXT,
  main_city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Brasil',
  service_regions TEXT[],
  neighborhoods TEXT[],
  business_type business_type,
  main_keyword TEXT,
  secondary_keywords TEXT[],
  priority_services TEXT[],
  most_profitable_services TEXT[],
  target_audience TEXT,
  persona TEXT,
  main_pains TEXT[],
  main_objections TEXT[],
  differentiators TEXT[],
  competitors TEXT[],
  project_objective TEXT,
  default_cta TEXT,
  default_link TEXT,
  priority_pages TEXT[],
  voice_tone TEXT,
  brand_positioning TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_owner ON companies(owner_id);
CREATE INDEX idx_companies_status ON companies(status);

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- COMPANY LOCATIONS (UNITS)
-- ============================================================
CREATE TABLE company_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  zip_code TEXT,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  hours JSONB,
  special_hours JSONB,
  service_area TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  google_location_id TEXT,
  google_account_id TEXT,
  sync_status location_sync_status DEFAULT 'not_synced',
  last_sync_at TIMESTAMPTZ,
  main_category TEXT,
  secondary_categories TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_locations_company ON company_locations(company_id);
CREATE INDEX idx_locations_owner ON company_locations(owner_id);
CREATE INDEX idx_locations_google_id ON company_locations(google_location_id);
CREATE INDEX idx_locations_city ON company_locations(city);

CREATE TRIGGER trg_locations_updated_at
  BEFORE UPDATE ON company_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- COMPANY BRANDING
-- ============================================================
CREATE TABLE company_branding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_colors TEXT[],
  secondary_colors TEXT[],
  typography TEXT,
  visual_style TEXT,
  image_rules TEXT,
  mandatory_logo_usage TEXT,
  prohibited_logo_usage TEXT,
  preferred_formats TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_branding_company ON company_branding(company_id);
CREATE TRIGGER trg_branding_updated_at
  BEFORE UPDATE ON company_branding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- COMPANY RULES
-- ============================================================
CREATE TABLE company_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_characters INTEGER,
  max_google_characters INTEGER,
  use_hashtags BOOLEAN DEFAULT false,
  max_hashtags INTEGER,
  allow_emojis BOOLEAN DEFAULT true,
  max_emojis INTEGER,
  use_dashes BOOLEAN DEFAULT true,
  use_lists BOOLEAN DEFAULT true,
  require_cta BOOLEAN DEFAULT false,
  default_cta TEXT,
  require_city BOOLEAN DEFAULT false,
  require_company_name BOOLEAN DEFAULT true,
  keyword_in_first_paragraph BOOLEAN DEFAULT false,
  allow_price BOOLEAN DEFAULT false,
  require_approval_for_price BOOLEAN DEFAULT true,
  allow_promotions BOOLEAN DEFAULT false,
  require_sources BOOLEAN DEFAULT false,
  require_faq BOOLEAN DEFAULT false,
  require_objective_answer BOOLEAN DEFAULT false,
  formality_level TEXT,
  voice_tone TEXT,
  forbidden_terms TEXT[],
  required_terms TEXT[],
  approved_expressions TEXT[],
  rejected_expressions TEXT[],
  never_invent TEXT[],
  min_score_for_approval INTEGER DEFAULT 90,
  editorial_frequency TEXT,
  min_interval_between_themes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_rules_company ON company_rules(company_id);
CREATE TRIGGER trg_rules_updated_at
  BEFORE UPDATE ON company_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- COMPANY KNOWLEDGE BASE
-- ============================================================
CREATE TABLE company_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES company_locations(id) ON DELETE SET NULL,
  type knowledge_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  verification_status verification_status DEFAULT 'unverified',
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  priority knowledge_priority DEFAULT 'medium',
  ai_usable BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_knowledge_company ON company_knowledge(company_id);
CREATE INDEX idx_knowledge_type ON company_knowledge(type);
CREATE INDEX idx_knowledge_ai_usable ON company_knowledge(ai_usable);
CREATE INDEX idx_knowledge_verification ON company_knowledge(verification_status);
CREATE INDEX idx_knowledge_search ON company_knowledge USING gin(content gin_trgm_ops);

CREATE TRIGGER trg_knowledge_updated_at
  BEFORE UPDATE ON company_knowledge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- KEYWORDS
-- ============================================================
CREATE TABLE keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  secondary_keywords TEXT[],
  local_variations TEXT[],
  questions TEXT[],
  commercial_terms TEXT[],
  pain_terms TEXT[],
  solution_terms TEXT[],
  comparison_terms TEXT[],
  urgency_terms TEXT[],
  related_entities TEXT[],
  cluster TEXT,
  pillar_page TEXT,
  intent keyword_intent,
  city TEXT,
  service TEXT,
  priority knowledge_priority DEFAULT 'medium',
  volume INTEGER,
  difficulty INTEGER,
  research_source TEXT,
  researched_at TIMESTAMPTZ,
  status keyword_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_keywords_company ON keywords(company_id);
CREATE INDEX idx_keywords_intent ON keywords(intent);
CREATE INDEX idx_keywords_cluster ON keywords(cluster);
CREATE INDEX idx_keywords_search ON keywords USING gin(keyword gin_trgm_ops);

CREATE TRIGGER trg_keywords_updated_at
  BEFORE UPDATE ON keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES company_locations(id) ON DELETE SET NULL,
  internal_name TEXT NOT NULL,
  google_name TEXT,
  description TEXT,
  category TEXT,
  main_keyword TEXT,
  secondary_keywords TEXT[],
  city TEXT,
  target_audience TEXT,
  benefits TEXT[],
  differentials TEXT[],
  cta TEXT,
  price NUMERIC(10,2),
  show_price BOOLEAN DEFAULT false,
  status service_status DEFAULT 'draft',
  sync_status TEXT,
  external_id TEXT,
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_services_company ON services(company_id);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_location ON services(location_id);
CREATE INDEX idx_services_external ON services(external_id);

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- CONTENT ITEMS
-- ============================================================
CREATE TABLE content_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES company_locations(id) ON DELETE SET NULL,
  type content_type NOT NULL,
  title TEXT NOT NULL,
  theme TEXT,
  content TEXT,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  main_keyword TEXT,
  secondary_keywords TEXT[],
  search_intent TEXT,
  city TEXT,
  target_audience TEXT,
  objective TEXT,
  cta TEXT,
  link TEXT,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  published_manually BOOLEAN DEFAULT false,
  external_url TEXT,
  external_id TEXT,
  status content_status DEFAULT 'draft',
  score INTEGER,
  score_override BOOLEAN DEFAULT false,
  score_override_reason TEXT,
  score_override_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_content_company ON content_items(company_id);
CREATE INDEX idx_content_status ON content_items(status);
CREATE INDEX idx_content_type ON content_items(type);
CREATE INDEX idx_content_scheduled ON content_items(scheduled_at);
CREATE INDEX idx_content_location ON content_items(location_id);
CREATE INDEX idx_content_search ON content_items USING gin(content gin_trgm_ops);

CREATE TRIGGER trg_content_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- CONTENT VERSIONS
-- ============================================================
CREATE TABLE content_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  score INTEGER,
  score_details JSONB,
  rule_results JSONB,
  ai_model TEXT,
  prompt_version TEXT,
  token_usage JSONB,
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_content_versions_content ON content_versions(content_id);
CREATE INDEX idx_content_versions_version ON content_versions(content_id, version);

-- ============================================================
-- CONTENT SOURCES (used during generation)
-- ============================================================
CREATE TABLE content_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  knowledge_id UUID REFERENCES company_knowledge(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content_snippet TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_content_sources_content ON content_sources(content_id);

-- ============================================================
-- MEDIA ASSETS
-- ============================================================
CREATE TABLE media_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES company_locations(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  dimensions TEXT,
  mime_type TEXT,
  file_size INTEGER,
  category TEXT,
  tags TEXT[],
  origin TEXT,
  usage_authorized BOOLEAN DEFAULT true,
  ai_usable BOOLEAN DEFAULT true,
  publishable BOOLEAN DEFAULT false,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_media_company ON media_assets(company_id);
CREATE INDEX idx_media_category ON media_assets(category);
CREATE INDEX idx_media_location ON media_assets(location_id);

CREATE TRIGGER trg_media_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES company_locations(id) ON DELETE SET NULL,
  external_id TEXT,
  author TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  review_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  current_response TEXT,
  response_status review_response_status DEFAULT 'none',
  sentiment review_sentiment,
  mentioned_service TEXT,
  relevant_phrase TEXT,
  urgency review_urgency,
  source TEXT,
  last_sync_at TIMESTAMPTZ,
  moderation_state TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_company ON reviews(company_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_response ON reviews(response_status);
CREATE INDEX idx_reviews_location ON reviews(location_id);
CREATE INDEX idx_reviews_external ON reviews(external_id);
CREATE INDEX idx_reviews_sentiment ON reviews(sentiment);

CREATE TABLE review_response_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  ai_model TEXT,
  prompt_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_review_versions_review ON review_response_versions(review_id);

-- ============================================================
-- GOOGLE INTEGRATION
-- ============================================================
CREATE TABLE google_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMPTZ,
  scope TEXT[],
  status google_connection_status DEFAULT 'disconnected',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_google_connections_owner ON google_connections(owner_id);

CREATE TRIGGER trg_google_connections_updated_at
  BEFORE UPDATE ON google_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE google_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES google_connections(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_account_id TEXT NOT NULL,
  account_name TEXT,
  account_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_google_accounts_connection ON google_accounts(connection_id);
CREATE UNIQUE INDEX idx_google_accounts_google_id ON google_accounts(google_account_id);

CREATE TABLE google_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES google_connections(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_account_id TEXT NOT NULL,
  google_location_id TEXT NOT NULL,
  location_name TEXT,
  location_address TEXT,
  location_phone TEXT,
  primary_category TEXT,
  additional_categories TEXT[],
  location_state TEXT,
  internal_location_id UUID REFERENCES company_locations(id) ON DELETE SET NULL,
  sync_status google_sync_status DEFAULT 'not_synced',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_google_locations_connection ON google_locations(connection_id);
CREATE UNIQUE INDEX idx_google_locations_external ON google_locations(google_location_id);
CREATE INDEX idx_google_locations_internal ON google_locations(internal_location_id);

CREATE TABLE google_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES google_connections(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  request_summary TEXT,
  response_summary TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_google_sync_logs_connection ON google_sync_logs(connection_id);
CREATE INDEX idx_google_sync_logs_created ON google_sync_logs(created_at);

-- ============================================================
-- PUBLISHING JOBS
-- ============================================================
CREATE TABLE publishing_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  location_id UUID REFERENCES company_locations(id) ON DELETE SET NULL,
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status job_status DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_attempt_at TIMESTAMPTZ,
  idempotency_key TEXT NOT NULL,
  external_response JSONB,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_publishing_jobs_idempotency ON publishing_jobs(idempotency_key);
CREATE INDEX idx_publishing_jobs_status ON publishing_jobs(status);
CREATE INDEX idx_publishing_jobs_scheduled ON publishing_jobs(scheduled_at);
CREATE INDEX idx_publishing_jobs_company ON publishing_jobs(company_id);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_logs_owner ON activity_logs(owner_id);
CREATE INDEX idx_activity_logs_company ON activity_logs(company_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- ============================================================
-- GOOGLE PERFORMANCE METRICS
-- ============================================================
CREATE TABLE google_performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_location_id TEXT NOT NULL,
  date DATE NOT NULL,
  impressions INTEGER,
  website_clicks INTEGER,
  phone_clicks INTEGER,
  direction_requests INTEGER,
  other_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_performance_location ON google_performance_metrics(google_location_id);
CREATE INDEX idx_performance_date ON google_performance_metrics(date);
CREATE UNIQUE INDEX idx_performance_location_date ON google_performance_metrics(google_location_id, date);

-- ============================================================
-- GOOGLE SEARCH KEYWORDS
-- ============================================================
CREATE TABLE google_search_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_location_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  month DATE NOT NULL,
  impressions INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_search_keywords_location ON google_search_keywords(google_location_id);
CREATE INDEX idx_search_keywords_month ON google_search_keywords(month);

-- ============================================================
-- APP SETTINGS
-- ============================================================
CREATE TABLE app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  locale TEXT DEFAULT 'pt-BR',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_app_settings_owner ON app_settings(owner_id);

CREATE TRIGGER trg_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AI SETTINGS
-- ============================================================
CREATE TABLE ai_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT,
  model TEXT,
  base_url TEXT,
  temperature NUMERIC(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_ai_settings_owner ON ai_settings(owner_id);

CREATE TRIGGER trg_ai_settings_updated_at
  BEFORE UPDATE ON ai_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PROMPT TEMPLATES
-- ============================================================
CREATE TABLE prompt_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  current_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_prompt_templates_key ON prompt_templates(key);

CREATE TRIGGER trg_prompt_templates_updated_at
  BEFORE UPDATE ON prompt_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE prompt_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_prompt_versions_template ON prompt_versions(template_id, version);

-- ============================================================
-- AUDIT
-- ============================================================
CREATE TABLE audit_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  total_score INTEGER,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_runs_company ON audit_runs(company_id);

CREATE TABLE audit_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_run_id UUID NOT NULL REFERENCES audit_runs(id) ON DELETE CASCADE,
  criterion TEXT NOT NULL,
  score INTEGER,
  max_score INTEGER,
  status TEXT DEFAULT 'pending',
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_items_run ON audit_items(audit_run_id);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  type TEXT DEFAULT 'monthly',
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reports_company ON reports(company_id);
CREATE UNIQUE INDEX idx_reports_company_month ON reports(company_id, month);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_owner ON notifications(owner_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================================
-- COMPANY SOURCES
-- ============================================================
CREATE TABLE company_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_company_sources_company ON company_sources(company_id);

-- ============================================================
-- COMPANY COMPETITORS
-- ============================================================
CREATE TABLE company_competitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_competitors_company ON company_competitors(company_id);

-- ============================================================
-- CONTENT MEDIA (junction table)
-- ============================================================
CREATE TABLE content_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  is_cover BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(content_id, media_id)
);

CREATE INDEX idx_content_media_content ON content_media(content_id);
CREATE INDEX idx_content_media_media ON content_media(media_id);

-- ============================================================
-- PROFILES (extended user info)
-- ============================================================
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Helper function to check if user is owner
CREATE OR REPLACE FUNCTION is_owner(record_owner_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN record_owner_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_response_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_search_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Generic policies: all tables with owner_id
-- Using dynamic approach: policy per table

-- COMPANIES
CREATE POLICY "Users can view own companies" ON companies
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can create own companies" ON companies
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own companies" ON companies
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own companies" ON companies
  FOR DELETE USING (is_owner(owner_id));

-- COMPANY LOCATIONS
CREATE POLICY "Users can view own locations" ON company_locations
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can create own locations" ON company_locations
  FOR INSERT WITH CHECK (is_owner(owner_id) AND EXISTS (SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid()));
CREATE POLICY "Users can update own locations" ON company_locations
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own locations" ON company_locations
  FOR DELETE USING (is_owner(owner_id));

-- COMPANY BRANDING
CREATE POLICY "Users can view own branding" ON company_branding
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own branding" ON company_branding
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own branding" ON company_branding
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own branding" ON company_branding
  FOR DELETE USING (is_owner(owner_id));

-- COMPANY RULES
CREATE POLICY "Users can view own rules" ON company_rules
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own rules" ON company_rules
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own rules" ON company_rules
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own rules" ON company_rules
  FOR DELETE USING (is_owner(owner_id));

-- COMPANY KNOWLEDGE
CREATE POLICY "Users can view own knowledge" ON company_knowledge
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own knowledge" ON company_knowledge
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own knowledge" ON company_knowledge
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own knowledge" ON company_knowledge
  FOR DELETE USING (is_owner(owner_id));

-- COMPANY SOURCES
CREATE POLICY "Users can view own sources" ON company_sources
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own sources" ON company_sources
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own sources" ON company_sources
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own sources" ON company_sources
  FOR DELETE USING (is_owner(owner_id));

-- COMPANY COMPETITORS
CREATE POLICY "Users can view own competitors" ON company_competitors
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own competitors" ON company_competitors
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own competitors" ON company_competitors
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own competitors" ON company_competitors
  FOR DELETE USING (is_owner(owner_id));

-- KEYWORDS
CREATE POLICY "Users can view own keywords" ON keywords
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own keywords" ON keywords
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own keywords" ON keywords
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own keywords" ON keywords
  FOR DELETE USING (is_owner(owner_id));

-- SERVICES
CREATE POLICY "Users can view own services" ON services
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own services" ON services
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own services" ON services
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own services" ON services
  FOR DELETE USING (is_owner(owner_id));

-- CONTENT ITEMS
CREATE POLICY "Users can view own content" ON content_items
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own content" ON content_items
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own content" ON content_items
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own content" ON content_items
  FOR DELETE USING (is_owner(owner_id));

-- CONTENT VERSIONS
CREATE POLICY "Users can view own content versions" ON content_versions
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own content versions" ON content_versions
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can delete own content versions" ON content_versions
  FOR DELETE USING (is_owner(owner_id));

-- CONTENT SOURCES
CREATE POLICY "Users can view own content sources" ON content_sources
  FOR SELECT USING (EXISTS (SELECT 1 FROM content_items WHERE id = content_id AND owner_id = auth.uid()));
CREATE POLICY "Users can manage own content sources" ON content_sources
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM content_items WHERE id = content_id AND owner_id = auth.uid()));

-- CONTENT MEDIA
CREATE POLICY "Users can view own content media" ON content_media
  FOR SELECT USING (EXISTS (SELECT 1 FROM content_items WHERE id = content_id AND owner_id = auth.uid()));
CREATE POLICY "Users can manage own content media" ON content_media
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM content_items WHERE id = content_id AND owner_id = auth.uid()));
CREATE POLICY "Users can update own content media" ON content_media
  FOR UPDATE USING (EXISTS (SELECT 1 FROM content_items WHERE id = content_id AND owner_id = auth.uid()));
CREATE POLICY "Users can delete own content media" ON content_media
  FOR DELETE USING (EXISTS (SELECT 1 FROM content_items WHERE id = content_id AND owner_id = auth.uid()));

-- MEDIA ASSETS
CREATE POLICY "Users can view own media" ON media_assets
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own media" ON media_assets
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own media" ON media_assets
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own media" ON media_assets
  FOR DELETE USING (is_owner(owner_id));

-- REVIEWS
CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own reviews" ON reviews
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (is_owner(owner_id));

-- REVIEW RESPONSE VERSIONS
CREATE POLICY "Users can view own review responses" ON review_response_versions
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own review responses" ON review_response_versions
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can delete own review responses" ON review_response_versions
  FOR DELETE USING (is_owner(owner_id));

-- GOOGLE CONNECTIONS
CREATE POLICY "Users can view own google connections" ON google_connections
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own google connections" ON google_connections
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own google connections" ON google_connections
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own google connections" ON google_connections
  FOR DELETE USING (is_owner(owner_id));

-- GOOGLE ACCOUNTS
CREATE POLICY "Users can view own google accounts" ON google_accounts
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own google accounts" ON google_accounts
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own google accounts" ON google_accounts
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own google accounts" ON google_accounts
  FOR DELETE USING (is_owner(owner_id));

-- GOOGLE LOCATIONS
CREATE POLICY "Users can view own google locations" ON google_locations
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own google locations" ON google_locations
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own google locations" ON google_locations
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own google locations" ON google_locations
  FOR DELETE USING (is_owner(owner_id));

-- GOOGLE SYNC LOGS
CREATE POLICY "Users can view own sync logs" ON google_sync_logs
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own sync logs" ON google_sync_logs
  FOR INSERT WITH CHECK (is_owner(owner_id));

-- GOOGLE PERFORMANCE METRICS
CREATE POLICY "Users can view own performance metrics" ON google_performance_metrics
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own performance metrics" ON google_performance_metrics
  FOR INSERT WITH CHECK (is_owner(owner_id));

-- GOOGLE SEARCH KEYWORDS
CREATE POLICY "Users can view own search keywords" ON google_search_keywords
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own search keywords" ON google_search_keywords
  FOR INSERT WITH CHECK (is_owner(owner_id));

-- PUBLISHING JOBS
CREATE POLICY "Users can view own publishing jobs" ON publishing_jobs
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own publishing jobs" ON publishing_jobs
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own publishing jobs" ON publishing_jobs
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own publishing jobs" ON publishing_jobs
  FOR DELETE USING (is_owner(owner_id));

-- ACTIVITY LOGS
CREATE POLICY "Users can view own activity logs" ON activity_logs
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own activity logs" ON activity_logs
  FOR INSERT WITH CHECK (is_owner(owner_id));

-- APP SETTINGS
CREATE POLICY "Users can view own app settings" ON app_settings
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own app settings" ON app_settings
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own app settings" ON app_settings
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own app settings" ON app_settings
  FOR DELETE USING (is_owner(owner_id));

-- AI SETTINGS
CREATE POLICY "Users can view own ai settings" ON ai_settings
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own ai settings" ON ai_settings
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own ai settings" ON ai_settings
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own ai settings" ON ai_settings
  FOR DELETE USING (is_owner(owner_id));

-- PROMPT TEMPLATES
CREATE POLICY "Users can view own prompt templates" ON prompt_templates
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own prompt templates" ON prompt_templates
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own prompt templates" ON prompt_templates
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own prompt templates" ON prompt_templates
  FOR DELETE USING (is_owner(owner_id));

-- PROMPT VERSIONS
CREATE POLICY "Users can view own prompt versions" ON prompt_versions
  FOR SELECT USING (EXISTS (SELECT 1 FROM prompt_templates WHERE id = template_id AND owner_id = auth.uid()));
CREATE POLICY "Users can manage own prompt versions" ON prompt_versions
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM prompt_templates WHERE id = template_id AND owner_id = auth.uid()));

-- AUDIT RUNS
CREATE POLICY "Users can view own audit runs" ON audit_runs
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own audit runs" ON audit_runs
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own audit runs" ON audit_runs
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own audit runs" ON audit_runs
  FOR DELETE USING (is_owner(owner_id));

-- AUDIT ITEMS
CREATE POLICY "Users can view own audit items" ON audit_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM audit_runs WHERE id = audit_run_id AND owner_id = auth.uid()));
CREATE POLICY "Users can manage own audit items" ON audit_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM audit_runs WHERE id = audit_run_id AND owner_id = auth.uid()));
CREATE POLICY "Users can update own audit items" ON audit_items
  FOR UPDATE USING (EXISTS (SELECT 1 FROM audit_runs WHERE id = audit_run_id AND owner_id = auth.uid()));

-- REPORTS
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own reports" ON reports
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own reports" ON reports
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own reports" ON reports
  FOR DELETE USING (is_owner(owner_id));

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (is_owner(owner_id));
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR INSERT WITH CHECK (is_owner(owner_id));
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (is_owner(owner_id));
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (is_owner(owner_id));

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (is_owner(user_id));
CREATE POLICY "Users can manage own profile" ON profiles
  FOR INSERT WITH CHECK (is_owner(user_id));
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (is_owner(user_id));
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (is_owner(user_id));
