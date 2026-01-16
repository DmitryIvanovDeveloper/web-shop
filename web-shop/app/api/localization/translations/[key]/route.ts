import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';

/**
 * GET /api/localization/translations/[key]?lang=<languageCode>
 * Get a specific translation by key and language
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const languageCode = searchParams.get('lang');
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);

    if (!languageCode) {
      return NextResponse.json(
        { error: 'lang parameter is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('key', decodedKey)
      .eq('language_code', languageCode)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('[GET /api/localization/translations/[key]] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to load translation' },
        { status: 500 }
      );
    }

    if (!data) {
      console.log('[GET /api/localization/translations/[key]] Translation not found:', {
        key: decodedKey,
        languageCode
      });
      return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      );
    }

    // Transform to API format
    const translation = {
      id: data.id,
      key: data.key,
      languageCode: data.language_code,
      value: data.value,
      isTranslated: data.is_translated,
      context: data.context,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    console.log('[GET /api/localization/translations/[key]] Translation retrieved:', {
      key: decodedKey,
      languageCode,
      isTranslated: translation.isTranslated
    });

    return NextResponse.json(translation);
  } catch (error) {
    console.error('[GET /api/localization/translations/[key]] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Unexpected error while loading translation' },
      { status: 500 }
    );
  }
}
