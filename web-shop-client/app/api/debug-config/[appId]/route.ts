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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No active config found' }, { status: 404 });
    }

    const config = data[0].config;

    // Возвращаем полную структуру для анализа
    return NextResponse.json({
      rawData: data[0],
      config: config,
      pages: config?.pages || [],
      styles: config?.styles || [],
      assets: config?.assets || [],
      symbols: config?.symbols || [],
      dataSources: config?.dataSources || []
    });
  } catch (error) {
    console.error('[API /api/debug-config/[appId]] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}