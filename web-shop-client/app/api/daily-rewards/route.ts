import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getSupabaseServerClient } from '../_lib/supabase-server-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const pathname = request.nextUrl.pathname;

    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

        if (pathname.includes('/active')) {
            const { data: reward, error } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('app_id', appId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {                     return NextResponse.json(null, { status: 404 });
        }
                return NextResponse.json(
          { error: 'Failed to fetch active daily reward' },
          { status: 500 }
        );
      }

      return NextResponse.json(reward);
    } else {
            const { data: rewards, error } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      if (error) {
                return NextResponse.json(
          { error: 'Failed to fetch daily rewards' },
          { status: 500 }
        );
      }

      console.log('[API /api/daily-rewards] Supabase response', {
        appId,
        totalRewards: (rewards || []).length,
        activeRewards: (rewards || []).filter((r: any) => r.is_active).length,
        rewards: (rewards || []).map((r: any) => ({ id: r.id, title: r.title, is_active: r.is_active }))
      });

      return NextResponse.json({ rewards: rewards || [] });
    }
  } catch (_error) {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


