-- Add support for offerCards array in app_configs.config JSONB field
-- This migration ensures that config.offerCards can store an array of offer card templates

-- Add comment explaining the offerCards structure in config JSONB
COMMENT ON COLUMN public.app_configs.config IS 
'Application configuration JSONB. Example structure:
{
  "theme": { ... },
  "shared": { ... },
  "offerCards": [
    {
      "id": "offer-card-1",
      "name": "Default Offer Card",
      "styles": {
        "container": { "backgroundColor": "#1F2937", "borderRadius": "8px", "shadow": "lg" },
        "image": { "backgroundColor": "#374151", "aspectRatio": "1.5 / 1" },
        "includedItems": { "backgroundColor": "#374151", "itemBackgroundColor": "#4B5563" },
        "title": { "fontSize": "clamp(10px, 4cqw, 18px)", "fontWeight": "bold", "color": "#FFFFFF" },
        "rarity": { "backgroundColor": "#8A2BE2", "color": "#FFFFFF" },
        "buyButton": { "backgroundColor": "#FF6B35", "color": "#FFFFFF", "borderRadius": "8px", "fontSize": "clamp(12px, 4cqw, 18px)", "fontWeight": "bold", "padding": "12px 8px", "minHeight": "48px" },
        "purchasedBadge": { "backgroundColor": "#10B981", "color": "#FFFFFF" },
        "bonuses": { "rpColor": "#FBBF24", "lpColor": "#3B82F6", "fontSize": "12px" }
      }
    }
  ]
}';



