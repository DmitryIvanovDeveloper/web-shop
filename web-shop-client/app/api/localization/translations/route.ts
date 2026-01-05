import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const languageCode = searchParams.get('lang');

    if (!languageCode) {
      return NextResponse.json(
        { error: 'Language code parameter is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('language_code', languageCode)
      .order('key', { ascending: true });

    if (error) {
      console.error('[API] Failed to get translations:', error);
      return NextResponse.json(
        { error: 'Failed to get translations' },
        { status: 500 }
      );
    }

    const translations = data.map(translation => ({
      key: translation.key,
      languageCode: translation.language_code,
      value: translation.value,
      isTranslated: translation.is_translated,
      createdAt: translation.created_at,
      updatedAt: translation.updated_at
    }));

    return NextResponse.json(translations);
  } catch (error) {
    console.error('[API] Unexpected error getting translations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates must be an array' },
        { status: 400 }
      );
    }

    const results = [];

    for (const update of updates) {
      const { key, languageCode, value } = update;

      // Check if translation exists
      const { data: existing } = await supabase
        .from('translations')
        .select('id')
        .eq('key', key)
        .eq('language_code', languageCode)
        .single();

      if (existing) {
        // Update existing translation
        const { error } = await supabase
          .from('translations')
          .update({
            value,
            is_translated: value.length > 0,
            updated_at: new Date().toISOString()
          })
          .eq('key', key)
          .eq('language_code', languageCode);

        if (error) {
          console.error('[API] Failed to update translation:', error);
          results.push({ key, languageCode, success: false, error: error.message });
        } else {
          results.push({ key, languageCode, success: true });
        }
      } else {
        // Create new translation
        const { error } = await supabase
          .from('translations')
          .insert({
            key,
            language_code: languageCode,
            value,
            is_translated: value.length > 0
          });

        if (error) {
          console.error('[API] Failed to create translation:', error);
          results.push({ key, languageCode, success: false, error: error.message });
        } else {
          results.push({ key, languageCode, success: true });
        }
      }
    }

    return NextResponse.json({
      message: 'Bulk translation update completed',
      results
    });
  } catch (error) {
    console.error('[API] Unexpected error in translations POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}