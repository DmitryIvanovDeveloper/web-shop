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

    // Process each update
    for (const update of updates) {
      const { key, languageCode, value } = update;

      if (!key || !languageCode) {
        return NextResponse.json(
          { error: `Invalid update: key and languageCode are required` },
          { status: 400 }
        );
      }

      // Check if translation exists
      const { data: existing, error: checkError } = await supabase
        .from('translations')
        .select('id')
        .eq('key', key)
        .eq('language_code', languageCode)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('[API] Failed to check existing translation:', checkError);
        return NextResponse.json(
          { error: checkError.message },
          { status: 500 }
        );
      }

      if (existing) {
        // Update existing
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
          console.error('[API] Failed to update translation:', updateError);
          return NextResponse.json(
            { error: updateError.message },
            { status: 500 }
          );
        }
        updatedCount++;
      } else {
        // Create new
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
          console.error('[API] Failed to create translation:', insertError);
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
  } catch (error) {
    console.error('[API] Unexpected error in bulk update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
