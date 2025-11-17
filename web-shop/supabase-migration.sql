-- Migration script for offer_scenarios and offer_engine_rules tables
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/sql

-- Create offer_scenarios table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.offer_scenarios (
  app_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  priority INTEGER,
  tags TEXT[],
  configuration JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (app_id, slug)
);

-- Create offer_engine_rules table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.offer_engine_rules (
  app_id TEXT NOT NULL,
  version TEXT NOT NULL,
  rule_tree JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (app_id, version)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_offer_scenarios_app_id ON public.offer_scenarios(app_id);
CREATE INDEX IF NOT EXISTS idx_offer_engine_rules_app_id ON public.offer_engine_rules(app_id);

-- Enable RLS
ALTER TABLE public.offer_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_engine_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Service role can manage offer_scenarios" ON public.offer_scenarios;
DROP POLICY IF EXISTS "Service role can manage offer_engine_rules" ON public.offer_engine_rules;
DROP POLICY IF EXISTS "Authenticated users can read offer_scenarios" ON public.offer_scenarios;
DROP POLICY IF EXISTS "Authenticated users can read offer_engine_rules" ON public.offer_engine_rules;

-- Create policies for service_role (bypasses RLS)
CREATE POLICY "Service role can manage offer_scenarios"
  ON public.offer_scenarios
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage offer_engine_rules"
  ON public.offer_engine_rules
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for authenticated users (read only)
CREATE POLICY "Authenticated users can read offer_scenarios"
  ON public.offer_scenarios
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read offer_engine_rules"
  ON public.offer_engine_rules
  FOR SELECT
  TO authenticated
  USING (true);

