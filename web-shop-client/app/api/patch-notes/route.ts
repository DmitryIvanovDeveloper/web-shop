import { NextRequest, NextResponse } from 'next/server';
import { container } from '../../../src/infrastructure/bootstrap/container';
import { PATCH_NOTES_TYPES } from '../../../src/modules/patch-notes/infrastructure/bootstrap/types';
import { CreatePatchNoteUseCase } from '../../../src/modules/patch-notes/application/use-cases/create-patch-note.use-case';
import { GetPublishedPatchNotesUseCase } from '../../../src/modules/patch-notes/application/use-cases/get-published-patch-notes.use-case';
// Removed import - Failure is no longer used

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required. Please specify ?appId=YOUR_APP_ID in the URL.' },
        { status: 400 }
      );
    }

    const useCase = container.get<GetPublishedPatchNotesUseCase>(
      PATCH_NOTES_TYPES.GetPublishedPatchNotesUseCase
    );

        const result = await useCase.execute(appId);
        if (result instanceof Failure) {
            return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    const data = (result as any).data;
        return NextResponse.json(data);

  } catch (error) {
        return NextResponse.json(
      { error: 'Unexpected error while fetching patch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

        if (!body.appId) {
      return NextResponse.json({ error: 'appId is required in the request body' }, { status: 400 });
    }

    const useCase = container.get<CreatePatchNoteUseCase>(
      PATCH_NOTES_TYPES.CreatePatchNoteUseCase
    );

    const result = await useCase.execute(body);

    if (result instanceof Failure) {
            return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json((result as any).data, { status: 201 });

  } catch (error) {
        return NextResponse.json(
      { error: 'Unexpected error while creating patch note' },
      { status: 500 }
    );
  }
}


