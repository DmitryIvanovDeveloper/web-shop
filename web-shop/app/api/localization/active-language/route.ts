import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
            return NextResponse.json(
        { error: 'Failed to get active language' },
        { status: 500 }
      );
    }

    const activeLanguage = data ? {
      code: data.code,
      name: data.name,
      nativeName: data.native_name,
      direction: data.direction,
      isActive: data.is_active,
      fallbackCode: data.fallback_code
    } : null;

    return NextResponse.json(activeLanguage);
  } catch (error) {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}