import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/bootstrap/container';
import { TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';

// GET /api/templates-grape/[id] - получить детали шаблона
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = container.get<DatabaseClientPort>(TYPES.DatabaseClient);
    const { id } = params;

    const { data, error } = await db
      .from('templates_grape')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ template: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
