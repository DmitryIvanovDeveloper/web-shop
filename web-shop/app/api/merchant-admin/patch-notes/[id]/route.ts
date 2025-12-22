import { NextRequest, NextResponse } from 'next/server';
import { container } from '../../../../../../src/infrastructure/bootstrap/container';
import { MERCHANT_ADMIN_PATCH_NOTES_TYPES } from '../../../../../../src/modules/merchant-admin/patch-notes/infrastructure/bootstrap/types';
import type { PatchNoteRepositoryPort } from '../../../../../../src/modules/merchant-admin/patch-notes/application/ports/patch-note-repository.port';
import { PatchNoteId } from '../../../../../../src/modules/merchant-admin/patch-notes/domain/value-objects/patch-note-id';

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
    const result = await patchNoteRepository.delete(patchNoteId);

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
