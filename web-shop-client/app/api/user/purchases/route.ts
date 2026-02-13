import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');
    const rawUserId = searchParams.get('userId');

    if (!appId) {
      return NextResponse.json({ error: 'appId is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

        if (rawUserId) {
                  const userId = rawUserId;
      
      const { data, error } = await supabase
        .from('transaction_log')
        .select('*')
        .eq('app_id', appId)
        .eq('user_id', userId)
        .in('payment_status', ['succeeded', 'completed']);

      if (error) {
                return NextResponse.json({ error: 'Failed to load purchases' }, { status: 500 });
      }

      return NextResponse.json(data ?? []);
    }

        return NextResponse.json([]);
  } catch (error) {
        return NextResponse.json({ error: 'Unexpected error while loading purchases' }, { status: 500 });
  }
}



