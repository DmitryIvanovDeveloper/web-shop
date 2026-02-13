import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

            const { error: deactivateError } = await supabase
      .from('languages')
      .update({ is_active: false })
      .neq('code', languageCode); 
    if (deactivateError) {
            return NextResponse.json(
        { error: 'Failed to deactivate other languages' },
        { status: 500 }
      );
    }

        const { error: activateError } = await supabase
      .from('languages')
      .update({ is_active: true })
      .eq('code', languageCode);

    if (activateError) {
            return NextResponse.json(
        { error: 'Failed to activate language' },
        { status: 500 }
      );
    }

        return NextResponse.json({
      message: 'Language activated successfully',
      languageCode
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



