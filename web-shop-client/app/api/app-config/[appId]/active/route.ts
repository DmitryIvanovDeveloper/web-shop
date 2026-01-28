import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('app_configs_grape')
      .select('*')
      .eq('app_id', resolvedParams.appId)
      .eq('is_active', true)
      .eq('is_draft', false)
      .order('version', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[API /api/app-config/[appId]/active] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.log('[API /api/app-config/[appId]/active] No active config found', { appId: resolvedParams.appId });
      return NextResponse.json({ error: 'Active config not found' }, { status: 404 });
    }

    console.log('[API /api/app-config/[appId]/active] Raw data from DB:', {
      dataLength: data.length,
      firstItemKeys: Object.keys(data[0]),
      hasConfig: !!data[0].config,
      configType: typeof data[0].config
    });

    const config = data[0].config;

    console.log('[API /api/app-config/[appId]/active] GrapeJS config loaded successfully', {
      appId: resolvedParams.appId,
      pagesCount: config?.pages?.length || 0,
      stylesCount: config?.styles?.length || 0,
      assetsCount: config?.assets?.length || 0,
      symbolsCount: config?.symbols?.length || 0
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error('[API /api/app-config/[appId]/active] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}