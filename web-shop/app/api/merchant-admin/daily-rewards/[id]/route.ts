import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/bootstrap/container';
import { TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';
import { z } from 'zod';

const UpdateDailyRewardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters').optional(),
  points: z.number().int().positive('Points must be a positive integer').optional(),
  isActive: z.boolean().optional(),
  dayNumber: z.number().int().positive('Day number must be a positive integer').nullable().optional()
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
            return NextResponse.json({ error: 'Failed to find daily reward' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Daily reward not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
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

    const validationResult = UpdateDailyRewardSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error.issues
      }, { status: 400 });
    }

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    const { data: existingReward, error: findError } = await databaseClient
      .from('daily_rewards')
      .select('*')
      .eq('id', id)
      .single();

    if (findError && findError.code !== 'PGRST116') {
            return NextResponse.json({ error: 'Failed to find daily reward' }, { status: 500 });
    }

    if (!existingReward) {
      return NextResponse.json({ error: 'Daily reward not found' }, { status: 404 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (validationResult.data.title !== undefined) {
      updateData.title = validationResult.data.title;
    }
    if (validationResult.data.description !== undefined) {
      updateData.description = validationResult.data.description;
    }
    if (validationResult.data.points !== undefined) {
      updateData.points = validationResult.data.points;
    }
    if (validationResult.data.isActive !== undefined) {
      updateData.is_active = validationResult.data.isActive;
    }
    if (validationResult.data.dayNumber !== undefined) {
      updateData.day_number = validationResult.data.dayNumber;
    }

    const { data, error } = await databaseClient
      .from('daily_rewards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
            return NextResponse.json({ error: 'Failed to update daily reward' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
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

    const { data: existingReward, error: findError } = await databaseClient
      .from('daily_rewards')
      .select('*')
      .eq('id', id)
      .single();

    if (findError && findError.code !== 'PGRST116') {
            return NextResponse.json({ error: 'Failed to find daily reward' }, { status: 500 });
    }

    if (!existingReward) {
      return NextResponse.json({ error: 'Daily reward not found' }, { status: 404 });
    }

    const { error } = await databaseClient
      .from('daily_rewards')
      .delete()
      .eq('id', id);

    if (error) {
            return NextResponse.json({ error: 'Failed to delete daily reward' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Daily reward deleted successfully' });
  } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
