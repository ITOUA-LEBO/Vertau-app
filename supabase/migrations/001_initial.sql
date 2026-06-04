-- ─────────────────────────────────────────────────────────────
-- Vertau — Migration initiale
-- Coller et exécuter dans : Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────

-- ── Extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT NOT NULL,
  name              TEXT,
  plan              TEXT NOT NULL DEFAULT 'free'
                    CHECK (plan IN ('free', 'creator', 'pro', 'agency')),
  stripe_customer_id        TEXT,
  stripe_subscription_id    TEXT,
  minutes_included  INT NOT NULL DEFAULT 30,
  minutes_used      NUMERIC(8,2) NOT NULL DEFAULT 0,
  overage_rate      NUMERIC(6,4) DEFAULT NULL,
  quota_reset_at    TIMESTAMPTZ,
  brand_logo_url    TEXT,
  brand_color       TEXT NOT NULL DEFAULT '#FBBF24',
  subtitle_style    TEXT NOT NULL DEFAULT 'karaoke'
                    CHECK (subtitle_style IN ('karaoke', 'highlight', 'impact')),
  default_template  TEXT NOT NULL DEFAULT 'minimal'
                    CHECK (default_template IN ('minimal', 'bold', 'modern', 'clean')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger : crée automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Processing Jobs ───────────────────────────────────────────
CREATE TABLE public.processing_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN (
                    'pending','extracting','transcribing',
                    'analyzing','cutting','rendering','done','failed'
                  )),
  source_type     TEXT NOT NULL CHECK (source_type IN ('youtube', 'upload')),
  source_url      TEXT,
  source_path     TEXT,
  source_title    TEXT,
  duration_sec    INT,
  minutes_used    NUMERIC(8,2),
  platforms       TEXT[] DEFAULT '{}',
  template        TEXT DEFAULT 'minimal',
  subtitle_style  TEXT DEFAULT 'karaoke',
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Clips ─────────────────────────────────────────────────────
CREATE TABLE public.clips (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES public.processing_jobs(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  hook            TEXT,
  score           INT CHECK (score BETWEEN 1 AND 10),
  start_time      NUMERIC(10,2),
  end_time        NUMERIC(10,2),
  platform        TEXT CHECK (platform IN ('tiktok', 'reels', 'shorts', 'all')),
  template        TEXT,
  subtitle_style  TEXT,
  file_path       TEXT,
  file_size       BIGINT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'ready', 'failed')),
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Subscriptions ─────────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT UNIQUE NOT NULL,
  plan                    TEXT NOT NULL,
  status                  TEXT NOT NULL,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT false,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_jobs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions    ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "own_profile" ON public.profiles
  FOR ALL USING (id = auth.uid());

-- Jobs
CREATE POLICY "own_jobs" ON public.processing_jobs
  FOR ALL USING (user_id = auth.uid());

-- Clips
CREATE POLICY "own_clips" ON public.clips
  FOR ALL USING (user_id = auth.uid());

-- Subscriptions
CREATE POLICY "own_subscription" ON public.subscriptions
  FOR ALL USING (user_id = auth.uid());

-- ── Storage buckets ───────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
  VALUES ('source-videos', 'source-videos', false)
  ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('clips', 'clips', false)
  ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('brand-assets', 'brand-assets', false)
  ON CONFLICT DO NOTHING;

-- Policies Storage : accès uniquement à ses propres fichiers
CREATE POLICY "own_source_videos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'source-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "own_clips" ON storage.objects
  FOR ALL USING (
    bucket_id = 'clips' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "own_brand_assets" ON storage.objects
  FOR ALL USING (
    bucket_id = 'brand-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
