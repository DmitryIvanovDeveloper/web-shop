-- Update the active app config to include Patch Notes button with correct ID
UPDATE app_configs
SET config = jsonb_set(
  config,
  '{modules,uiRenderer,sidebar,layout,children}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'id' = 'button-68b97f4c-358c-461f-a428-4b1eebcedc41' THEN
          -- Update Store button ID to match default
          jsonb_set(elem, '{id}', '"store-button"')
        WHEN elem->>'id' = 'button-95ac11a9-a9de-4b9b-8a78-d9cb143aa3e0' THEN
          -- Update Home button ID
          jsonb_set(elem, '{id}', '"home-button"')
        WHEN elem->>'id' = 'button-b7e96a7d-2547-4220-b667-c5bdac19e3f8' THEN
          -- Update New Button ID
          jsonb_set(elem, '{id}', '"new-button"')
        ELSE elem
      END
    )
    FROM jsonb_array_elements(config->'modules'->'uiRenderer'->'sidebar'->'layout'->'children') elem
  ) || jsonb_build_array(
    jsonb_build_object(
      'id', 'patch-notes-button',
      'type', 'Button',
      'props', jsonb_build_object(
        'icon', '📋',
        'text', 'Patch Notes',
        'fullWidth', true
      ),
      'styles', jsonb_build_object(
        'padding', '13.2px',
        'textAlign', 'left',
        'textColor', '#FFFFFF',
        'borderRadius', '5.6rem',
        'justifyContent', 'flex-start',
        'backgroundColor', '#a43232'
      ),
      'actions', jsonb_build_object(
        'onClick', jsonb_build_object(
          'type', 'custom',
          'handler', 'navigateToPatchNotes'
        )
      )
    )
  )
)
WHERE app_id = 'APP123'
  AND is_active = true
  AND is_draft = false;








