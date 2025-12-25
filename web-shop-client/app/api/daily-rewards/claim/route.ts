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

    // Verify reward exists and is active
    const { data: reward, error: rewardError } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('is_active', true)
      .single();

    if (rewardError || !reward) {
      return NextResponse.json({ error: 'Reward not found or not active' }, { status: 404 });
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

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[POST /api/daily-rewards/claim] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
