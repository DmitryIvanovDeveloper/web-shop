import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    const { data: translations, error } = await supabase
      .from('translations')
      .select('*')
      .order('key', { ascending: true })
      .order('language_code', { ascending: true });

    if (error) {
            return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

        const apiTranslations = (translations || []).map((translation: any) => ({
      key: translation.key,
      languageCode: translation.language_code,
      value: translation.value,
      isTranslated: translation.value && translation.value.length > 0,
      createdAt: translation.created_at,
      updatedAt: translation.updated_at
    }));

    return NextResponse.json(apiTranslations);
  } catch (error) {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

