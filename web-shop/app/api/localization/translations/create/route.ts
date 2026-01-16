import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    const { key, languageCode, value } = await request.json();

    if (!key || !languageCode || value === undefined) {
      return NextResponse.json(
        { error: 'key, languageCode, and value are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('translations')
      .insert({
        key,
        language_code: languageCode,
        value,
        is_translated: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[API] Failed to create translation:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Map to API response format
    const apiTranslation = {
      key: data.key,
      languageCode: data.language_code,
      value: data.value,
      isTranslated: data.value && data.value.length > 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return NextResponse.json(apiTranslation);
  } catch (error) {
    console.error('[API] Unexpected error creating translation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
