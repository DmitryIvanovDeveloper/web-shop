import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json({ error: 'appId is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('app_configs')
      .select('id, app_id, merchant_id, version, is_active, is_draft, config, created_at')
      .eq('app_id', appId)
      .eq('is_active', true)
      .eq('is_draft', false)
      .order('version', { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ config: null }, { status: 200 });
    }

    return NextResponse.json({ config: data[0] }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

