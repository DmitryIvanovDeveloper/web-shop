import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/bootstrap/container';
import { MERCHANT_ADMIN_PATCH_NOTES_TYPES } from '@/modules/merchant-admin/patch-notes/infrastructure/bootstrap/types';
import type { PatchNoteRepositoryPort } from '@/modules/merchant-admin/patch-notes/application/ports/patch-note-repository.port';
import { PatchNoteId } from '@/modules/merchant-admin/patch-notes/domain/value-objects/patch-note-id';

// GET /api/merchant-admin/patch-notes/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json({ error: 'App ID is required' }, { status: 400 });
    }

    const patchNoteRepository = container.get<PatchNoteRepositoryPort>(
      MERCHANT_ADMIN_PATCH_NOTES_TYPES.PatchNoteRepository
    );

    const patchNoteId = PatchNoteId.fromString(id);
    const result = await patchNoteRepository.findById(patchNoteId, appId);

    if (!result.isSuccess) {
      console.error('[GET /api/merchant-admin/patch-notes/[id]] Failed to find patch note', result.error);
      return NextResponse.json({ error: 'Failed to find patch note' }, { status: 500 });
    }

    if (!result.value) {
      return NextResponse.json({ error: 'Patch note not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: result.value.id.value,
      appId: result.value.appId,
      version: result.value.version.value,
      title: result.value.title,
      description: result.value.description,
      changes: result.value.changes.map(change => ({
        type: change.type,
        description: change.description
      })),
      status: result.value.status,
      createdAt: result.value.createdAt.toISOString(),
      updatedAt: result.value.updatedAt.toISOString(),
      publishedAt: result.value.publishedAt?.toISOString(),
      scheduledFor: result.value.scheduledFor?.toISOString()
    });
  } catch (error) {
    console.error('[GET /api/merchant-admin/patch-notes/[id]] Unexpected error', error);
    return NextResponse.json({ error: 'Unexpected error while fetching patch note' }, { status: 500 });
  }
}

// DELETE /api/merchant-admin/patch-notes/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json({ error: 'App ID is required' }, { status: 400 });
    }

    const patchNoteRepository = container.get<PatchNoteRepositoryPort>(
      MERCHANT_ADMIN_PATCH_NOTES_TYPES.PatchNoteRepository
    );

    const patchNoteId = PatchNoteId.fromString(id);
    const result = await patchNoteRepository.delete(patchNoteId, appId);

    if (!result.isSuccess) {
      console.error('[DELETE /api/merchant-admin/patch-notes/[id]] Failed to delete patch note', result.error);
      return NextResponse.json({ error: 'Failed to delete patch note' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Patch note deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/merchant-admin/patch-notes/[id]] Unexpected error', error);
    return NextResponse.json({ error: 'Unexpected error while deleting patch note' }, { status: 500 });
  }
}
