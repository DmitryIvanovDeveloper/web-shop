import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/bootstrap/container';
import { TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { id, appId } = body;

    if (!id || !appId) {
      return NextResponse.json({ error: 'Patch note ID and App ID are required' }, { status: 400 });
    }

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    // Update the patch note to published status
    const { data, error } = await databaseClient
      .from('patch_notes')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('app_id', appId)
      .select()
      .single();

    if (error) {
      console.error('[POST /api/merchant-admin/patch-notes/publish] Failed to publish patch note', error);
      return NextResponse.json({ error: 'Failed to publish patch note' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[POST /api/merchant-admin/patch-notes/publish] Unexpected error', error);
    return NextResponse.json({ error: 'Unexpected error while publishing patch note' }, { status: 500 });
  }
}
