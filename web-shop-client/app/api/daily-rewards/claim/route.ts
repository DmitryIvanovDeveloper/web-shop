import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

    if (supabaseUrl == null || supabaseAnonKey == null) {
      return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const body = await request.json();
    const { id, userId, rewardId, claimedAt, pointsAwarded } = body;

    if (userId == null || rewardId == null || pointsAwarded == null) {
      return NextResponse.json({
        error: 'Missing required fields: userId, rewardId, pointsAwarded'
      }, { status: 400 });
    }

        const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const { data: existingClaims, error: checkError } = await supabase
      .from('daily_reward_claims')
      .select('*')
      .eq('user_id', userId)
      .gte('claimed_at', startOfDay.toISOString())
      .lt('claimed_at', endOfDay.toISOString());

    if (checkError) {
            return NextResponse.json({ error: 'Failed to check existing claims' }, { status: 500 });
    }

    if (existingClaims != null && existingClaims.length > 0) {
      return NextResponse.json({
        error: 'Daily reward already claimed today',
        lastClaim: existingClaims[0]
      }, { status: 409 });
    }

                const { data: reward, error: rewardError } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('id', rewardId)
      .single();

    if (rewardError != null || reward == null) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    }

        const claimData = {
      id: id ?? crypto.randomUUID(),
      user_id: userId,
      reward_id: rewardId,
      claimed_at: claimedAt ?? new Date().toISOString(),
      points_awarded: pointsAwarded
    };

    const { data, error } = await supabase
      .from('daily_reward_claims')
      .insert(claimData)
      .select()
      .single();

    if (error) {
            return NextResponse.json({ error: 'Failed to save daily reward claim' }, { status: 500 });
    }

        let nextRewardId: string | null = null;
    let nextClaimDate: Date | null = null;

        const { data: allRewards, error: rewardsError } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('app_id', reward.app_id ?? '')
      .order('day_number', { ascending: true, nullsFirst: false });

    if (rewardsError == null && allRewards != null && allRewards.length > 0) {
            const claimedReward = allRewards.find(r => r.id === rewardId);
      if (claimedReward != null) {
        if (claimedReward.day_number != null) {
                    const nextReward = allRewards.find(r => r.day_number === claimedReward.day_number + 1);
          if (nextReward) {
            nextRewardId = nextReward.id;
          }
        } else if (allRewards.length > 0) {
                    nextRewardId = allRewards[0].id;
        }
      }

            if (nextRewardId != null) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        nextClaimDate = tomorrow;
      }
    }

    return NextResponse.json({
      ...data,
      nextRewardId,
      nextClaimDate: nextClaimDate?.toISOString() ?? null
    }, { status: 201 });
  } catch (_error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


