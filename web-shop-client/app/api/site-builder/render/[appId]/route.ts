import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
): Promise<NextResponse> {
  try {
    console.log('[API] Starting request');
    const { appId } = await params;
    console.log(`[API] Processing appId: ${appId}`);

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('app_configs_grape')
      .select('*')
      .eq('app_id', appId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: `No active configuration found for app: ${appId}` },
        { status: 404 }
      );
    }

    const row = data[0];

    const response: ApiResponse = {
      appId: row.app_id,
      merchantId: row.merchant_id,
      version: row.version,
      isActive: row.is_active,
      config: row.config
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
