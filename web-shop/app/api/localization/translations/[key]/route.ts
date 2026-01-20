import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';

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

    if (error && error.code !== 'PGRST116') { 
            return NextResponse.json(
        { error: 'Failed to load translation' },
        { status: 500 }
      );
    }

    if (!data) {
            return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      );
    }

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

        return NextResponse.json(translation);
  } catch (error) {
        return NextResponse.json(
      { error: 'Unexpected error while loading translation' },
      { status: 500 }
    );
  }
}
