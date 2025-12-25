import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../_lib/supabase-server-client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');
    const rawUserId = searchParams.get('userId');

    if (!appId || !rawUserId) {
      return NextResponse.json({ productIds: [] });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('transaction_log')
      .select('product_id')
      .eq('app_id', appId)
      .eq('user_id', rawUserId)
      .in('payment_status', ['succeeded', 'completed']);

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[GET /api/purchases] Supabase error', error);
      return NextResponse.json({ error: 'Failed to load purchases' }, { status: 500 });
    }

    const productIds =
      data
        ?.map((item: { product_id: string | null }) => item.product_id)
        .filter((productId: string | null): productId is string => typeof productId === 'string') ??
      [];

    return NextResponse.json({ productIds });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[GET /api/purchases] Unexpected error', error);
    return NextResponse.json(
      { error: 'Unexpected error while loading purchases' },
      { status: 500 }
    );
  }
}














