-- Add page_styles column to page_configs table
-- This column stores page-level styles like padding

ALTER TABLE public.page_configs
ADD COLUMN IF NOT EXISTS page_styles JSONB DEFAULT '{}';

-- Add comment explaining the page_styles JSONB structure
COMMENT ON COLUMN public.page_configs.page_styles IS 
'Page-level styles object. Example:
{
  "padding": "2rem" | "20px" | "1rem 2rem"
}';




