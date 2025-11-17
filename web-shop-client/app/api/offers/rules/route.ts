import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';

const DEFAULT_APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? 'webshop-demo';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId') ?? DEFAULT_APP_ID;

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('offer_engine_rules')
      .select('rule_tree')
      .eq('app_id', appId)
      .maybeSingle();

    if (error) {
      console.error('[GET /api/offers/rules] Supabase error', error);
      return NextResponse.json({ error: 'Failed to load offer rule tree' }, { status: 500 });
    }

    if (!data?.rule_tree) {
      return NextResponse.json({ error: 'Rule tree not found' }, { status: 404 });
    }

    // Return entire rule tree (including scenarios array) so client can evaluate all scenarios
    return NextResponse.json(data.rule_tree);
  } catch (error) {
    console.error('[GET /api/offers/rules] Unexpected error', error);
    return NextResponse.json({ error: 'Unexpected error while loading offer rule tree' }, { status: 500 });
  }
}
