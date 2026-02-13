import { NextRequest, NextResponse } from 'next/server';
import { container } from '../../../../src/infrastructure/bootstrap/container';
import { PATCH_NOTES_TYPES } from '../../../../src/modules/patch-notes/infrastructure/bootstrap/types';
import { PublishPatchNoteUseCase } from '../../../../src/modules/patch-notes/application/use-cases/publish-patch-note.use-case';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Patch note ID is required and must be a string' },
        { status: 400 }
      );
    }

    const useCase = container.get<PublishPatchNoteUseCase>(
      PATCH_NOTES_TYPES.PublishPatchNoteUseCase
    );

    const result = await useCase.execute({ id });

    if (!result.isSuccess) {
            return NextResponse.json(
        { error: result.error!.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.value);

  } catch (error) {
        return NextResponse.json(
      { error: 'Unexpected error while publishing patch note' },
      { status: 500 }
    );
  }
}




