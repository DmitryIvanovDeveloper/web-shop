import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/bootstrap/container';
import { TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';
import { CreateDailyRewardUseCase } from '@/modules/merchant-admin/daily-rewards/application/use-cases/create-daily-reward.use-case';
import { DAILY_REWARDS_TYPES } from '@/modules/merchant-admin/daily-rewards/infrastructure/bootstrap/daily-rewards.container';
import { z } from 'zod';

// Real database only - no mock storage
let useMockStorage = false; // Always use real Supabase database

const CreateDailyRewardSchema = z.object({
  appId: z.string().min(1, 'App ID is required'),
  type: z.enum(['points', 'currency', 'item']),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  points: z.number().int().positive('Points must be a positive integer'),
  dayNumber: z.number().int().positive('Day number must be a positive integer').nullable().optional()
});

const UpdateDailyRewardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters').optional(),
  points: z.number().int().positive('Points must be a positive integer').optional(),
  isActive: z.boolean().optional(),
  dayNumber: z.number().int().positive('Day number must be a positive integer').nullable().optional()
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');
    const status = searchParams.get('status') as 'active' | 'inactive' | 'all' | null;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const dayNumber = searchParams.get('dayNumber');

    console.log('[GET /api/merchant-admin/daily-rewards] Request params:', { appId, status, limit, offset, dayNumber });

    if (!appId) {
      return NextResponse.json({ error: 'App ID is required' }, { status: 400 });
    }

    // Use real Supabase database

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    let query = databaseClient
      .from('daily_rewards')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false });
    
    // Note: Supabase JS client doesn't support nullsFirst option directly
    // We'll sort by day_number in application code if needed
    // For now, just order by created_at

    // Apply status filter
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }
    // 'all' or null means no status filter

    // Apply day number filter
    if (dayNumber) {
      const dayNumberNum = parseInt(dayNumber, 10);
      if (!isNaN(dayNumberNum) && dayNumberNum > 0) {
        query = query.eq('day_number', dayNumberNum);
      }
    }

    // Apply pagination
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (limitNum > 0 && limitNum <= 100) {
        query = query.limit(limitNum);
      }
    }

    if (offset) {
      const offsetNum = parseInt(offset, 10);
      if (offsetNum >= 0) {
        query = query.range(offsetNum, offsetNum + (limit ? parseInt(limit, 10) - 1 : 99));
      }
    }

    const { data, error } = await query;

    console.log('[GET /api/merchant-admin/daily-rewards] Database result:', { data: data?.length || 0, error });

    if (error) {
      console.error('[GET /api/merchant-admin/daily-rewards] Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch daily rewards' }, { status: 500 });
    }

    console.log('[GET /api/merchant-admin/daily-rewards] Returning data:', data);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('[GET /api/merchant-admin/daily-rewards] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = CreateDailyRewardSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error.issues
      }, { status: 400 });
    }

    // Use direct Supabase call instead of repository for now
    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    const rewardData: any = {
      id: crypto.randomUUID(),
      app_id: validationResult.data.appId,
      type: validationResult.data.type,
      title: validationResult.data.title,
      description: validationResult.data.description,
      points: validationResult.data.points,
      is_active: true
    };

    // Add day_number if provided
    if (validationResult.data.dayNumber !== undefined && validationResult.data.dayNumber !== null) {
      rewardData.day_number = validationResult.data.dayNumber;
    }

    const { data, error } = await databaseClient
      .from('daily_rewards')
      .insert(rewardData)
      .select()
      .single();

    if (error) {
      console.error('[POST /api/merchant-admin/daily-rewards] Database error:', error);
      return NextResponse.json({ error: 'Failed to create daily reward' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[POST /api/merchant-admin/daily-rewards] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
