-- SQL script to add default sections to /home page in Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/editor/33064?schema=public

-- First, check if page /home exists
-- SELECT * FROM page_configs WHERE page_slug = 'home' AND app_id = 'APP123';

-- If page exists but has no sections, update it with default sections
-- Replace 'APP123' with your actual app_id if different

-- Generate a UUID for the section (you can use any UUID generator)
-- Example UUID: content-a1b2c3d4-e5f6-7890-abcd-ef1234567890

UPDATE page_configs
SET 
  sections = jsonb_build_array(
    jsonb_build_object(
      'id', 'content-' || gen_random_uuid()::text,
      'type', 'content',
      'layout', jsonb_build_object(
        'grid', '1-column',
        'gap', '1rem',
        'align', 'start'
      ),
      'styles', jsonb_build_object(),
      'components', jsonb_build_array()
    )
  ),
  updated_at = now()
WHERE 
  app_id = 'APP123' 
  AND page_slug = 'home' 
  AND is_draft = true
  AND (sections IS NULL OR sections = '[]'::jsonb OR jsonb_array_length(sections) = 0);

-- If page doesn't exist, create it with default sections
-- Uncomment and run this if the UPDATE above didn't affect any rows:

/*
INSERT INTO page_configs (
  app_id,
  page_slug,
  version,
  is_active,
  is_draft,
  sections,
  page_styles,
  created_at,
  updated_at
)
SELECT 
  'APP123',
  'home',
  1,
  false,
  true,
  jsonb_build_array(
    jsonb_build_object(
      'id', 'content-' || gen_random_uuid()::text,
      'type', 'content',
      'layout', jsonb_build_object(
        'grid', '1-column',
        'gap', '1rem',
        'align', 'start'
      ),
      'styles', jsonb_build_object(),
      'components', jsonb_build_array()
    )
  ),
  jsonb_build_object(),
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM page_configs 
  WHERE app_id = 'APP123' 
  AND page_slug = 'home' 
  AND is_draft = true
);
*/

-- Verify the result
-- SELECT id, app_id, page_slug, sections, updated_at 
-- FROM page_configs 
-- WHERE page_slug = 'home' AND app_id = 'APP123';

