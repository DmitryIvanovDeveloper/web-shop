import { NextRequest, NextResponse } from 'next/server';
import { container } from '../../../../../src/infrastructure/bootstrap/container';
import { MERCHANT_ADMIN_PATCH_NOTES_TYPES } from '../../../../../src/modules/merchant-admin/patch-notes/infrastructure/bootstrap/types';
import type { GetPatchNotesUseCase } from '../../../../../src/modules/merchant-admin/patch-notes/application/use-cases/get-patch-notes.use-case';
import type { CreatePatchNoteUseCase } from '../../../../../src/modules/merchant-admin/patch-notes/application/use-cases/create-patch-note.use-case';
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json({ error: 'App ID is required' }, { status: 400 });
    }

    const getPatchNotesUseCase = container.get<GetPatchNotesUseCase>(
      MERCHANT_ADMIN_PATCH_NOTES_TYPES.GetPatchNotesUseCase
    );

    const result = await getPatchNotesUseCase.execute({ appId });

    if (!result.isSuccess) {
      console.error('[GET /api/merchant-admin/patch-notes] Failed to fetch patch notes', result.error);
      return NextResponse.json({ error: 'Failed to fetch patch notes' }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[GET /api/merchant-admin/patch-notes] Unexpected error', error);
    return NextResponse.json({ error: 'Unexpected error while fetching patch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validationResult = CreatePatchNoteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    const { appId, version, title, description, changes } = validationResult.data;

    const createPatchNoteUseCase = container.get<CreatePatchNoteUseCase>(
      MERCHANT_ADMIN_PATCH_NOTES_TYPES.CreatePatchNoteUseCase
    );

    const result = await createPatchNoteUseCase.execute({
      appId,
      version,
      title,
      description,
      changes
    });

    if (!result.isSuccess) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('[POST /api/merchant-admin/patch-notes] Unexpected error', error);
    return NextResponse.json({ error: 'Unexpected error while creating patch note' }, { status: 500 });
  }
}
