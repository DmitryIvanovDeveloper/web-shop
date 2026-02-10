import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { languageCode } = body;

    if (!languageCode) {
      return NextResponse.json(
        { error: 'Language code is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { error: deactivateAllError } = await supabase
      .from('languages')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .neq('code', languageCode); 

    if (deactivateAllError) {
            return NextResponse.json(
        { error: 'Failed to deactivate other languages' },
        { status: 500 }
      );
    }

    const { error: activateError } = await supabase
      .from('languages')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('code', languageCode);

    if (activateError) {
            return NextResponse.json(
        { error: 'Failed to activate language' },
        { status: 500 }
      );
    }

        return NextResponse.json({
      success: true,
      message: 'Language deactivated successfully'
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
