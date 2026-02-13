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
            return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

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
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


