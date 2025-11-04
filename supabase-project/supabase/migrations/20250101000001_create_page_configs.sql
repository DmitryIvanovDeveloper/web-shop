-- Create page_configs table for Page Constructor feature
-- This table stores page layouts composed of sections (Header/Content/Footer)
-- Each section contains components with grid layout configuration

CREATE TABLE IF NOT EXISTS public.page_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id VARCHAR(255) NOT NULL,
  page_slug VARCHAR(255) NOT NULL DEFAULT 'home',
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT true,
  sections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_page_draft UNIQUE(app_id, page_slug, is_draft)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_page_configs_app_id ON public.page_configs(app_id);
CREATE INDEX IF NOT EXISTS idx_page_configs_active ON public.page_configs(is_active, page_slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_page_configs_draft ON public.page_configs(is_draft, page_slug) WHERE is_draft = true;

-- Create updated_at trigger
CREATE TRIGGER handle_page_configs_updated_at
  BEFORE UPDATE ON public.page_configs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.page_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated users to manage their app's page configs
CREATE POLICY "Authenticated users can view page configs" ON public.page_configs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert page configs" ON public.page_configs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update page configs" ON public.page_configs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete page configs" ON public.page_configs
  FOR DELETE USING (auth.role() = 'authenticated');

-- Add comment explaining the sections JSONB structure
COMMENT ON COLUMN public.page_configs.sections IS 
'Array of page sections. Each section contains:
{
  "id": "section-uuid",
  "type": "header" | "content" | "footer",
  "layout": {
    "grid": "1-column" | "2-column" | "3-column" | "4-column",
    "gap": "1rem",
    "align": "start" | "center" | "end"
  },
  "styles": { "backgroundColor": "#fff", "padding": "2rem" },
  "components": [ComponentNode array - reuses existing ComponentNode structure]
}';

