import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/bootstrap/container';
import { TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const appId = searchParams.get('appId');

    if (!id && !appId) {
      return NextResponse.json({ error: 'Either id or appId is required' }, { status: 400 });
    }

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    let query = databaseClient.from('projects');
    let filter: any = {};

    if (id) {
      filter = { id };
    } else if (appId) {
      filter = { app_id: appId };
    }

    const { count, error } = await query
      .select('*', { count: 'exact', head: true })
      .eq(Object.keys(filter)[0], Object.values(filter)[0]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ exists: (count ?? 0) > 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}