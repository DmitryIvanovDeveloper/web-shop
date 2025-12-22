import { NextRequest, NextResponse } from 'next/server';
import { container } from '../../../src/infrastructure/bootstrap/container';
import { PATCH_NOTES_TYPES } from '../../../src/modules/patch-notes/infrastructure/bootstrap/types';
import { CreatePatchNoteUseCase } from '../../../src/modules/patch-notes/application/use-cases/create-patch-note.use-case';
import { GetPublishedPatchNotesUseCase } from '../../../src/modules/patch-notes/application/use-cases/get-published-patch-notes.use-case';

export async function GET(): Promise<NextResponse> {
  try {
    const useCase = container.get<GetPublishedPatchNotesUseCase>(
      PATCH_NOTES_TYPES.GetPublishedPatchNotesUseCase
    );

    const result = await useCase.execute();

    if (!result.isSuccess) {
      console.error('[GET /api/patch-notes] Use case failed', result.error);
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);

  } catch (error) {
    console.error('[GET /api/patch-notes] Unexpected error', error);
    return NextResponse.json(
      { error: 'Unexpected error while fetching patch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const useCase = container.get<CreatePatchNoteUseCase>(
      PATCH_NOTES_TYPES.CreatePatchNoteUseCase
    );

    const result = await useCase.execute(body);

    if (!result.isSuccess) {
      console.error('[POST /api/patch-notes] Use case failed', result.error);
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });

  } catch (error) {
    console.error('[POST /api/patch-notes] Unexpected error', error);
    return NextResponse.json(
      { error: 'Unexpected error while creating patch note' },
      { status: 500 }
    );
  }
}
