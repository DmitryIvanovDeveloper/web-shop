import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { key, languageCode, value } = await request.json();

    if (!key || !languageCode) {
      return NextResponse.json(
        { error: 'key and languageCode are required' },
        { status: 400 }
      );
    }

    // Try to update first
    const { data: updateData, error: updateError } = await supabase
      .from('translations')
      .update({
        value,
        is_translated: true,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
      .eq('language_code', languageCode)
      .select()
      .single();

    let translation = updateData;
    let wasCreated = false;

    if (updateError && updateError.code === 'PGRST116') {
      // Not found, try to insert
      const { data: insertData, error: insertError } = await supabase
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

      if (insertError) {
        console.error('[API] Failed to insert translation:', insertError);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      translation = insertData;
      wasCreated = true;
    } else if (updateError) {
      console.error('[API] Failed to update translation:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Map to API response format
    const apiTranslation = {
      key: translation.key,
      languageCode: translation.language_code,
      value: translation.value,
      isTranslated: translation.value && translation.value.length > 0,
      createdAt: translation.created_at,
      updatedAt: translation.updated_at
    };

    return NextResponse.json({
      translation: apiTranslation,
      wasCreated
    });
  } catch (error) {
    console.error('[API] Unexpected error upserting translation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
