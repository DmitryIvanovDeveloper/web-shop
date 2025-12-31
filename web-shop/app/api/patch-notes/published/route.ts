import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/bootstrap/container';
import { TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json({ error: 'App ID is required' }, { status: 400 });
    }

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    // Get published patch notes ordered by published_at desc, then created_at desc
    const { data, error } = await databaseClient
      .from('patch_notes')
      .select('*')
      .eq('app_id', appId)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/patch-notes/published] Failed to find patch notes', error);
      return NextResponse.json({ error: 'Failed to fetch patch notes' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('[GET /api/patch-notes/published] Unexpected error', error);
    return NextResponse.json({ error: 'Unexpected error while fetching patch notes' }, { status: 500 });
  }
}






