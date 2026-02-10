import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    const { updates } = await request.json();

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'updates array is required' },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    let createdCount = 0;

    for (const update of updates) {
      const { key, languageCode, value } = update;

      if (!key || !languageCode) {
        return NextResponse.json(
          { error: `Invalid update: key and languageCode are required` },
          { status: 400 }
        );
      }

      const { data: existing, error: checkError } = await supabase
        .from('translations')
        .select('id')
        .eq('key', key)
        .eq('language_code', languageCode)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { 
                return NextResponse.json(
          { error: checkError.message },
          { status: 500 }
        );
      }

      if (existing) {
        
        const { error: updateError } = await supabase
          .from('translations')
          .update({
            value,
            is_translated: true,
            updated_at: new Date().toISOString()
          })
          .eq('key', key)
          .eq('language_code', languageCode);

        if (updateError) {
                    return NextResponse.json(
            { error: updateError.message },
            { status: 500 }
          );
        }
        updatedCount++;
      } else {
        
        const { error: insertError } = await supabase
          .from('translations')
          .insert({
            key,
            language_code: languageCode,
            value,
            is_translated: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
                    return NextResponse.json(
            { error: insertError.message },
            { status: 500 }
          );
        }
        createdCount++;
      }
    }

    return NextResponse.json({
      message: 'Translations updated successfully',
      updatedCount,
      createdCount
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
