import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { name, nativeName, fallbackCode } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Language code is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (nativeName !== undefined) updateData.native_name = nativeName;
    if (fallbackCode !== undefined) updateData.fallback_code = fallbackCode;

    const { data, error } = await supabase
      .from('languages')
      .update(updateData)
      .eq('code', code)
      .select()
      .single();

    if (error) {
      console.error('[API] Failed to update language:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Language not found' },
        { status: 404 }
      );
    }

    // Map to API response format
    const language = {
      id: data.id,
      code: data.code,
      name: data.name,
      nativeName: data.native_name,
      direction: data.direction,
      isActive: data.is_active,
      fallbackCode: data.fallback_code,
      flag: data.flag,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    console.log('[API] Language updated successfully:', code);
    return NextResponse.json(language);
  } catch (error) {
    console.error('[API] Unexpected error updating language:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
