import { getSupabaseServerClient } from 'app/api/_lib/supabase-server-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

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
