import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/bootstrap/container';
import { TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';
import { PatchNote } from '@/modules/merchant-admin/patch-notes/domain/entities/patch-note';
import { PatchNoteId } from '@/modules/merchant-admin/patch-notes/domain/value-objects/patch-note-id';
import { Version } from '@/modules/merchant-admin/patch-notes/domain/value-objects/version';
import { ChangeItem } from '@/modules/merchant-admin/patch-notes/domain/entities/change-item';
import { z } from 'zod';

const CreatePatchNoteSchema = z.object({
  appId: z.string().min(1, 'App ID is required'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semantic format (x.y.z)'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  changes: z.array(z.object({
    type: z.enum(['feature', 'bugfix', 'improvement', 'breaking-change']),
    description: z.string().min(1, 'Change description cannot be empty'),
  })).min(1, 'At least one change item is required'),
});

const UpdatePatchNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  changes: z.array(z.object({
    type: z.enum(['feature', 'bugfix', 'improvement', 'breaking-change']),
    description: z.string().min(1, 'Change description cannot be empty'),
  })).min(1, 'At least one change item is required').optional(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');
    const id = searchParams.get('id');
    const version = searchParams.get('version');
    const status = searchParams.get('status') as 'draft' | 'published' | 'scheduled' | null;

    if (!appId) {
      return NextResponse.json({ error: 'App ID is required' }, { status: 400 });
    }

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    if (id) {
      
      const { data, error } = await databaseClient
        .from('patch_notes')
        .select('*')
        .eq('id', id)
        .eq('app_id', appId)
        .single();

      if (error && error.code !== 'PGRST116') {
                return NextResponse.json({ error: 'Failed to find patch note' }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json([]);
      }

      return NextResponse.json([data]);
    } else if (version) {
      
      const { data, error } = await databaseClient
        .from('patch_notes')
        .select('*')
        .eq('version', version)
        .eq('app_id', appId)
        .single();

      if (error && error.code !== 'PGRST116') {
                return NextResponse.json({ error: 'Failed to find patch note' }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json([]);
      }

      return NextResponse.json([data]);
    } else {
      
      let query = databaseClient
        .from('patch_notes')
        .select('*')
        .eq('app_id', appId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
                return NextResponse.json({ error: 'Failed to fetch patch notes' }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }
  } catch (error) {
        return NextResponse.json({ error: 'Unexpected error while fetching patch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validationResult = CreatePatchNoteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.issues }, { status: 400 });
    }

    const { appId, version, title, description, changes } = validationResult.data;

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    const patchNote = PatchNote.create(
      PatchNoteId.create(),
      appId,
      Version.create(version),
      title,
      description,
      changes.map(change => ChangeItem.create(change.type, change.description))
    );

    const row = {
      id: patchNote.id.value,
      app_id: patchNote.appId,
      version: patchNote.version.value,
      title: patchNote.title,
      description: patchNote.description || null,
      changes: patchNote.changes.map(change => ({
        type: change.type,
        description: change.description
      })),
      status: patchNote.status,
      created_at: patchNote.createdAt.toISOString(),
      updated_at: patchNote.updatedAt.toISOString(),
      published_at: patchNote.publishedAt?.toISOString() ?? null,
      scheduled_for: patchNote.scheduledFor?.toISOString() ?? null
    };

    const { error } = await databaseClient
      .from('patch_notes')
      .insert(row);

    if (error) {
            return NextResponse.json({ error: `Failed to create patch note: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      id: patchNote.id.value,
      appId: patchNote.appId,
      version: patchNote.version.value,
      title: patchNote.title,
      description: patchNote.description,
      changes: patchNote.changes.map(change => ({
        type: change.type,
        description: change.description
      })),
      status: patchNote.status,
      createdAt: patchNote.createdAt.toISOString(),
      updatedAt: patchNote.updatedAt.toISOString(),
      publishedAt: patchNote.publishedAt?.toISOString(),
      scheduledFor: patchNote.scheduledFor?.toISOString()
    }, { status: 201 });
  } catch (error) {
        return NextResponse.json({ error: 'Unexpected error while creating patch note' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const appId = searchParams.get('appId');

    if (!id || !appId) {
      return NextResponse.json({ error: 'ID and App ID are required' }, { status: 400 });
    }

    const body = await request.json();
    const validationResult = UpdatePatchNoteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.issues }, { status: 400 });
    }

    const { title, description, changes } = validationResult.data;

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (changes !== undefined) {
      updateData.changes = changes.map(change => ({
        type: change.type,
        description: change.description
      }));
    }

    const { error } = await databaseClient
      .from('patch_notes')
      .update(updateData)
      .eq('id', id)
      .eq('app_id', appId);

    if (error) {
            return NextResponse.json({ error: `Failed to update patch note: ${error.message}` }, { status: 500 });
    }

    const { data: updatedData, error: fetchError } = await databaseClient
      .from('patch_notes')
      .select('*')
      .eq('id', id)
      .eq('app_id', appId)
      .single();

    if (fetchError) {
            return NextResponse.json({ error: 'Failed to fetch updated patch note' }, { status: 500 });
    }

    return NextResponse.json(updatedData);
  } catch (error) {
        return NextResponse.json({ error: 'Unexpected error while updating patch note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const appId = searchParams.get('appId');

    if (!id || !appId) {
      return NextResponse.json({ error: 'ID and App ID are required' }, { status: 400 });
    }

    const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    const { error } = await databaseClient
      .from('patch_notes')
      .delete()
      .eq('id', id)
      .eq('app_id', appId);

    if (error) {
            return NextResponse.json({ error: `Failed to delete patch note: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
        return NextResponse.json({ error: 'Unexpected error while deleting patch note' }, { status: 500 });
  }
}
