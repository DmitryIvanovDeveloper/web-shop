import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const body = await request.json();
    const { id, userId, rewardId, claimedAt, pointsAwarded } = body;

    if (!userId || !rewardId || !pointsAwarded) {
      return NextResponse.json({
        error: 'Missing required fields: userId, rewardId, pointsAwarded'
      }, { status: 400 });
    }

    // Check if user already claimed today
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
      console.error('[POST /api/daily-rewards/claim] Check existing claims error:', checkError);
      return NextResponse.json({ error: 'Failed to check existing claims' }, { status: 500 });
    }

    if (existingClaims && existingClaims.length > 0) {
      return NextResponse.json({
        error: 'Daily reward already claimed today',
        lastClaim: existingClaims[0]
      }, { status: 409 });
    }

    // Verify reward exists
    // Note: We don't check is_active here because activity is determined dynamically
    // based on day_number and user's claim history, not by the is_active field in DB
    const { data: reward, error: rewardError } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('id', rewardId)
      .single();

    if (rewardError || !reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    }

    // Create claim record
    const claimData = {
      id: id || crypto.randomUUID(),
      user_id: userId,
      reward_id: rewardId,
      claimed_at: claimedAt || new Date().toISOString(),
      points_awarded: pointsAwarded
    };

    const { data, error } = await supabase
      .from('daily_reward_claims')
      .insert(claimData)
      .select()
      .single();

    if (error) {
      console.error('[POST /api/daily-rewards/claim] Database error:', error);
      return NextResponse.json({ error: 'Failed to save daily reward claim' }, { status: 500 });
    }

    // Calculate next reward and next claim date
    let nextRewardId: string | null = null;
    let nextClaimDate: Date | null = null;

    // Get all rewards for the app to find next one
    const { data: allRewards, error: rewardsError } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('app_id', reward.app_id || '')
      .order('day_number', { ascending: true, nullsLast: true });

    if (!rewardsError && allRewards && allRewards.length > 0) {
      // Find claimed reward's day_number
      const claimedReward = allRewards.find(r => r.id === rewardId);
      if (claimedReward) {
        if (claimedReward.day_number !== null) {
          // Find next reward by day_number
          const nextReward = allRewards.find(r => r.day_number === claimedReward.day_number + 1);
          if (nextReward) {
            nextRewardId = nextReward.id;
          }
        } else if (allRewards.length > 0) {
          // If no day_number, return first reward
          nextRewardId = allRewards[0].id;
        }
      }

      // Calculate next claim date (tomorrow at midnight)
      if (nextRewardId) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        nextClaimDate = tomorrow;
      }
    }

    return NextResponse.json({
      ...data,
      nextRewardId,
      nextClaimDate: nextClaimDate?.toISOString() || null
    }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/daily-rewards/claim] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
