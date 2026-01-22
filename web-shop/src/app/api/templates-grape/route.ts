import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/bootstrap/container';
import { TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';

// GET /api/templates-grape - список шаблонов
export async function GET(request: NextRequest) {
  try {
    const db = container.get<DatabaseClientPort>(TYPES.DatabaseClient);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);

    let dbQuery = db
      .from('templates_grape')
      .select('id, name, description, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (query) {
      dbQuery = dbQuery.ilike('name', `%${query}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    dbQuery = dbQuery.range(from, to);

    const { data, error } = await dbQuery;

    if (error) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      templates: data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/templates-grape - создать шаблон
export async function POST(request: NextRequest) {
  try {
    const db = container.get<DatabaseClientPort>(TYPES.DatabaseClient);
    const body = await request.json();
    
    const { name, description, templateData } = body;

    if (!name || !templateData) {
      return NextResponse.json(
        { error: 'Name and templateData are required' },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from('templates_grape')
      .insert({
        name,
        description: description ?? null,
        template_data: templateData,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create template: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ template: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/templates-grape - обновить шаблон
export async function PUT(request: NextRequest) {
  try {
    const db = container.get<DatabaseClientPort>(TYPES.DatabaseClient);
    const body = await request.json();
    
    const { id, name, description, templateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (templateData !== undefined) updateData.template_data = templateData;

    const { data, error } = await db
      .from('templates_grape')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update template: ${error.message}` },
        { status: 500 }
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

// DELETE /api/templates-grape?id=xxx - удалить шаблон
export async function DELETE(request: NextRequest) {
  try {
    const db = container.get<DatabaseClientPort>(TYPES.DatabaseClient);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const { error } = await db
      .from('templates_grape')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete template: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
