import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';

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

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('language_code', languageCode)
      .order('key', { ascending: true });

    if (error) {
            return NextResponse.json(
        { error: 'Failed to get translations' },
        { status: 500 }
      );
    }

    const navKeys = (data || []).filter((t: any) => t.key && t.key.startsWith('nav.')).map((t: any) => t.key);
    const expectedNavKeys = ['nav.home', 'nav.store', 'nav.patchNotes', 'nav.dailyRewards', 'nav.loyaltyProgram', 'nav.news', 'nav.updates', 'nav.events'];
  
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

      const supabase = getSupabaseServerClient();

      const { data: existing } = await supabase
        .from('translations')
        .select('id')
        .eq('key', key)
        .eq('language_code', languageCode)
        .single();

      if (existing) {
        
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
                    results.push({ key, languageCode, success: false, error: error.message });
        } else {
          results.push({ key, languageCode, success: true });
        }
      } else {
        
        const { error } = await supabase
          .from('translations')
          .insert({
            key,
            language_code: languageCode,
            value,
            is_translated: value.length > 0
          });

        if (error) {
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
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}