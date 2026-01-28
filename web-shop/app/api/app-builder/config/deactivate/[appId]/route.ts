import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../_lib/supabase-server-client';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
): Promise<NextResponse> {
  try {
    const { appId } = await params;

    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { exceptId } = body;

    const supabase = getSupabaseServerClient();

    // Деактивировать все конфигурации для app_id, кроме exceptId
    const { error } = await supabase
      .from('app_configs_grape')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('app_id', appId)
      .neq('id', exceptId || '');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in PUT /api/app-builder/config/deactivate/[appId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}