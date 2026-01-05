-- Migration: Create localization tables
-- Created: 2025-12-31
-- Description: Tables for localization system (languages and translations)

-- Create languages table
CREATE TABLE IF NOT EXISTS public.languages (
    code VARCHAR(5) PRIMARY KEY, -- ISO language code (en, ar, he, etc.)
    name VARCHAR(100) NOT NULL, -- Display name (English, العربية)
    native_name VARCHAR(100) NOT NULL, -- Native name (English, العربية)
    direction VARCHAR(3) NOT NULL CHECK (direction IN ('ltr', 'rtl')), -- Text direction
    is_active BOOLEAN NOT NULL DEFAULT false, -- Is this language currently active
    fallback_code VARCHAR(5), -- Fallback language code for missing translations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    FOREIGN KEY (fallback_code) REFERENCES public.languages(code) ON DELETE SET NULL,
    UNIQUE(name),
    UNIQUE(native_name)
);

-- Create translations table
CREATE TABLE IF NOT EXISTS public.translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL, -- Translation key (e.g., 'products.buyButton')
    language_code VARCHAR(5) NOT NULL, -- Language code reference
    value TEXT NOT NULL, -- Translated text
    is_translated BOOLEAN NOT NULL DEFAULT true, -- Is translation complete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE,
    UNIQUE(key, language_code)
);

-- Insert default languages (only those mentioned in the task)
INSERT INTO public.languages (code, name, native_name, direction, is_active)
VALUES
    ('en', 'English', 'English', 'ltr', true), -- Default active language
    ('ar', 'Arabic', 'العربية', 'rtl', false) -- RTL language (mentioned in task)
ON CONFLICT (code) DO NOTHING;

-- Insert sample translations for English (active language)
INSERT INTO public.translations (key, language_code, value, is_translated)
VALUES
    -- Authentication translations
    ('auth.loginButton', 'en', 'Login', true),
    ('auth.logoutButton', 'en', 'Logout', true),
    ('auth.welcomeTitle', 'en', 'Welcome', true),
    ('auth.successMessage', 'en', 'Success!', true),

    -- Products translations
    ('products.buyButton', 'en', 'Buy Now', true),
    ('products.purchasedBadge', 'en', 'PURCHASED', true),
    ('products.emptyState', 'en', 'No products available', true),
    ('products.loadingState', 'en', 'Loading products...', true)
ON CONFLICT (key, language_code) DO NOTHING;

-- Insert sample translations for Arabic (RTL demonstration)
INSERT INTO public.translations (key, language_code, value, is_translated)
VALUES
    -- Authentication translations
    ('auth.loginButton', 'ar', 'تسجيل الدخول', true),
    ('auth.logoutButton', 'ar', 'تسجيل الخروج', true),
    ('auth.welcomeTitle', 'ar', 'مرحباً', true),
    ('auth.successMessage', 'ar', 'نجح!', true),

    -- Products translations
    ('products.buyButton', 'ar', 'اشترِ الآن', true),
    ('products.purchasedBadge', 'ar', 'تم الشراء', true),
    ('products.emptyState', 'ar', 'لا توجد منتجات متاحة', true),
    ('products.loadingState', 'ar', 'جارٍ تحميل المنتجات...', true)
ON CONFLICT (key, language_code) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE public.languages IS 'Supported languages for localization system';
COMMENT ON TABLE public.translations IS 'Translation strings for different languages and keys';

COMMENT ON COLUMN public.languages.code IS 'ISO 639-1 language code (2 letters)';
COMMENT ON COLUMN public.languages.direction IS 'Text direction: ltr (left-to-right) or rtl (right-to-left)';
COMMENT ON COLUMN public.languages.fallback_code IS 'Fallback language for missing translations';

COMMENT ON COLUMN public.translations.key IS 'Translation key in dot notation (module.field.subfield)';
COMMENT ON COLUMN public.translations.is_translated IS 'Whether this translation is complete and ready for use';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_languages_active ON public.languages(is_active);
CREATE INDEX IF NOT EXISTS idx_languages_direction ON public.languages(direction);
CREATE INDEX IF NOT EXISTS idx_translations_language_code ON public.translations(language_code);
CREATE INDEX IF NOT EXISTS idx_translations_key ON public.translations(key);
CREATE INDEX IF NOT EXISTS idx_translations_language_key ON public.translations(language_code, key);
CREATE INDEX IF NOT EXISTS idx_translations_is_translated ON public.translations(is_translated);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_localization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS languages_updated_at_trigger
    BEFORE UPDATE ON public.languages
    FOR EACH ROW
    EXECUTE FUNCTION update_localization_updated_at();

CREATE TRIGGER IF NOT EXISTS translations_updated_at_trigger
    BEFORE UPDATE ON public.translations
    FOR EACH ROW
    EXECUTE FUNCTION update_localization_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access, authenticated write access)
CREATE POLICY "Allow public read access to languages" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users full access to languages" ON public.languages FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to translations" ON public.translations FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users full access to translations" ON public.translations FOR ALL USING (auth.role() = 'authenticated');
