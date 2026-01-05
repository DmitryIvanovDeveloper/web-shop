-- Remove unnecessary languages, keep only Russian, Arabic, Hebrew, and English
DELETE FROM translations WHERE language_code NOT IN ('ru', 'ar', 'he', 'en');
DELETE FROM languages WHERE code NOT IN ('ru', 'ar', 'he', 'en');
