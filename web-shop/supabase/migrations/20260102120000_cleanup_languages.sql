-- Migration: Clean up languages table
-- Created: 2026-01-02
-- Description: Remove all languages except Arabic and English

-- Delete translations for languages that will be removed
DELETE FROM public.translations
WHERE language_code NOT IN ('ar', 'en');

-- Delete languages except Arabic and English
DELETE FROM public.languages
WHERE code NOT IN ('ar', 'en');

