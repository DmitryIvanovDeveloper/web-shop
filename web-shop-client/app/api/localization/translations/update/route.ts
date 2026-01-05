import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { languageCode, translations } = body;

    if (!languageCode || !Array.isArray(translations)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected languageCode and translations array.' },
        { status: 400 }
      );
    }

    console.log('[API] Updating translations', { languageCode, count: translations.length });

    // Process each translation update
    const results = [];
    for (const translation of translations) {
      const { key, value, context } = translation;

      if (!key || typeof value !== 'string') {
        console.error('[API] Invalid translation data', { key, value, context });
        continue;
      }

      try {
        // Check if translation already exists
        const { data: existing, error: fetchError } = await supabase
          .from('translations')
          .select('id')
          .eq('key', key)
          .eq('language_code', languageCode)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
          console.error('[API] Error checking existing translation', { key, languageCode, error: fetchError });
          continue;
        }

        const translationData = {
          key,
          value: value.trim(),
          language_code: languageCode,
          is_translated: value.trim().length > 0,
          context: context?.trim() || null,
          updated_at: new Date().toISOString()
        };

        let result;
        if (existing) {
          // Update existing translation
          result = await supabase
            .from('translations')
            .update(translationData)
            .eq('key', key)
            .eq('language_code', languageCode);
        } else {
          // Insert new translation
          result = await supabase
            .from('translations')
            .insert(translationData);
        }

        if (result.error) {
          console.error('[API] Error saving translation', { key, languageCode, error: result.error });
        } else {
          results.push({ key, success: true });
          console.log('[API] Translation saved', { key, languageCode, value: value.substring(0, 50) + '...' });
        }
      } catch (error) {
        console.error('[API] Unexpected error processing translation', { key, languageCode, error });
      }
    }

    console.log('[API] Translation update completed', { processed: results.length, total: translations.length });

    return NextResponse.json({
      success: true,
      updated: results.length,
      total: translations.length
    });
  } catch (error) {
    console.error('[API] Unexpected error in translations update', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
