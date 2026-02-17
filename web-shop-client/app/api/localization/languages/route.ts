import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
);

export async function GET(request: NextRequest) {
    try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
            const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
                return NextResponse.json(
          { error: 'Language not found' },
          { status: 404 }
        );
      }

      const language = {
        code: data.code,
        name: data.name,
        nativeName: data.native_name,
        direction: data.direction,
        isActive: data.is_active,
        fallbackCode: data.fallback_code
      };

      return NextResponse.json(language);
    } else {
                  const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
                return NextResponse.json(
          { error: 'Failed to get languages' },
          { status: 500 }
        );
      }

      console.log('[API] Raw data from Supabase:', JSON.stringify(data, null, 2));
                  const allowedCodes = ['ar', 'en'];
      const filteredData = data.filter(lang => allowedCodes.includes(lang.code));

      console.log('[API] Filtered languages (only ar, en):', filteredData.length);

      const languages = filteredData.map(lang => ({
        code: lang.code,
        name: lang.name,
        nativeName: lang.native_name,
        direction: lang.direction,
        isActive: lang.is_active,
        fallbackCode: lang.fallback_code
      }));

                  return NextResponse.json(languages);
    }
  } catch (_error) {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

