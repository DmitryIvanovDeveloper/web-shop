import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/bootstrap/container';
import { TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';
import { z } from 'zod';

// Real database only - no mock storage

const UpdateDailyRewardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters').optional(),
  points: z.number().int().positive('Points must be a positive integer').optional(),
  isActive: z.boolean().optional()
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Reward ID is required' }, { status: 400 });
    }

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    const { data, error } = await databaseClient
      .from('daily_rewards')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[GET /api/merchant-admin/daily-rewards/[id]] Database error:', error);
      return NextResponse.json({ error: 'Failed to find daily reward' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Daily reward not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET /api/merchant-admin/daily-rewards/[id]] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Reward ID is required' }, { status: 400 });
    }

    // Validate input
    const validationResult = UpdateDailyRewardSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error.issues
      }, { status: 400 });
    }

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    // Check if reward exists
    const { data: existingReward, error: findError } = await databaseClient
      .from('daily_rewards')
      .select('*')
      .eq('id', id)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error('[PUT /api/merchant-admin/daily-rewards/[id]] Find error:', findError);
      return NextResponse.json({ error: 'Failed to find daily reward' }, { status: 500 });
    }

    if (!existingReward) {
      return NextResponse.json({ error: 'Daily reward not found' }, { status: 404 });
    }

    // Update reward
    const updateData = {
      ...validationResult.data,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await databaseClient
      .from('daily_rewards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[PUT /api/merchant-admin/daily-rewards/[id]] Update error:', error);
      return NextResponse.json({ error: 'Failed to update daily reward' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[PUT /api/merchant-admin/daily-rewards/[id]] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Reward ID is required' }, { status: 400 });
    }

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    // Check if reward exists
    const { data: existingReward, error: findError } = await databaseClient
      .from('daily_rewards')
      .select('*')
      .eq('id', id)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error('[DELETE /api/merchant-admin/daily-rewards/[id]] Find error:', findError);
      return NextResponse.json({ error: 'Failed to find daily reward' }, { status: 500 });
    }

    if (!existingReward) {
      return NextResponse.json({ error: 'Daily reward not found' }, { status: 404 });
    }

    // Delete reward
    const { error } = await databaseClient
      .from('daily_rewards')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DELETE /api/merchant-admin/daily-rewards/[id]] Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete daily reward' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Daily reward deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/merchant-admin/daily-rewards/[id]] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
