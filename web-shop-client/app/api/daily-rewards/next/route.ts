import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');
    const userId = searchParams.get('userId');

    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required. Please specify ?appId=YOUR_APP_ID in the URL.' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required. Please specify ?userId=YOUR_USER_ID in the URL.' },
        { status: 400 }
      );
    }

        const { data: allRewards, error: rewardsError } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('app_id', appId)
      .order('day_number', { ascending: true, nullsFirst: false });

    if (rewardsError) {
            return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
    }

    if (!allRewards || allRewards.length === 0) {
      return NextResponse.json({
        reward: null,
        canClaim: false,
        nextClaimDate: null,
        lastClaimDate: null,
        lastClaimRewardId: null
      });
    }

        const { data: lastClaim, error: claimError } = await supabase
      .from('daily_reward_claims')
      .select('*')
      .eq('user_id', userId)
      .order('claimed_at', { ascending: false })
      .limit(1);

    if (claimError) {
            return NextResponse.json({ error: 'Failed to check claim history' }, { status: 500 });
    }

        let nextDayNumber: number;
    if (!lastClaim || lastClaim.length === 0) {
            nextDayNumber = 1;
    } else {
            const lastClaimData = lastClaim[0];
      const lastClaimedReward = allRewards.find(r => r.id === lastClaimData.reward_id);

      if (!lastClaimedReward || lastClaimedReward.day_number === null) {
                nextDayNumber = 1;
      } else {
                nextDayNumber = lastClaimedReward.day_number + 1;
      }
    }

        const nextReward = allRewards.find(r => r.day_number === nextDayNumber);

    if (!nextReward) {
            return NextResponse.json({
        reward: null,
        canClaim: false,
        nextClaimDate: null,
        lastClaimDate: lastClaim?.[0]?.claimed_at || null,
        lastClaimRewardId: lastClaim?.[0]?.reward_id || null
      });
    }

        const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const { data: todayClaims, error: todayClaimsError } = await supabase
      .from('daily_reward_claims')
      .select('*')
      .eq('user_id', userId)
      .gte('claimed_at', startOfDay.toISOString())
      .lt('claimed_at', endOfDay.toISOString());

    if (todayClaimsError) {
            return NextResponse.json({ error: 'Failed to check claim status' }, { status: 500 });
    }

        const canClaim = !todayClaims || todayClaims.length === 0;

        let nextClaimDate = null;
    if (!canClaim && lastClaim && lastClaim.length > 0) {
      const lastClaimDate = new Date(lastClaim[0].claimed_at);
      nextClaimDate = new Date(lastClaimDate);
      nextClaimDate.setDate(nextClaimDate.getDate() + 1);
      nextClaimDate.setHours(0, 0, 0, 0);
    }

    return NextResponse.json({
      reward: nextReward,
      canClaim: canClaim,
      nextClaimDate: nextClaimDate?.toISOString() || null,
      lastClaimDate: lastClaim?.[0]?.claimed_at || null,
      lastClaimRewardId: lastClaim?.[0]?.reward_id || null
    });

  } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


