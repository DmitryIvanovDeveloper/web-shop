import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';
import { stringToDeterministicUuid } from '../../../../src/shared/utils/deterministic-uuid';

interface UserOfferContextRow {
  readonly context: Record<string, unknown> | null;
  readonly updated_at: string | null;
}

interface UpdateRequestBody {
  readonly appId?: string;
  readonly userId?: string;
  readonly patch?: Record<string, unknown>;
  readonly removeKeys?: readonly string[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const appId = searchParams.get('appId');
  const rawUserId = searchParams.get('userId');

  if (!appId || !rawUserId) {
    return NextResponse.json({ error: 'appId and userId are required' }, { status: 400 });
  }

  try {
    const userId = normalizeUserId(rawUserId);
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('user_offer_context')
      .select('context, updated_at')
      .eq('app_id', appId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to load context' }, { status: 500 });
    }

    const context = (data?.context ?? {}) as Record<string, unknown>;
    return NextResponse.json({
      context,
      updatedAt: data?.updated_at ?? new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Unexpected error while loading context' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => null)) as UpdateRequestBody | null;

  if (!body?.appId || !body?.userId) {
    return NextResponse.json({ error: 'appId and userId are required' }, { status: 400 });
  }

  if (!body.patch && (!body.removeKeys || body.removeKeys.length === 0)) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }

  try {
    const normalizedUserId = normalizeUserId(body.userId);
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('user_offer_context')
      .select('context')
      .eq('app_id', body.appId)
      .eq('user_id', normalizedUserId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to load current context' }, { status: 500 });
    }

    const currentContext = (data?.context ?? {}) as Record<string, unknown>;
    const nextContext: Record<string, unknown> = {
      ...currentContext,
      ...(body.patch ?? {}),
    };

    if (body.removeKeys?.length) {
      for (const key of body.removeKeys) {
        delete nextContext[key];
      }
    }

    const updatedAt = new Date().toISOString();

    const { error: upsertError } = await supabase
      .from('user_offer_context')
      .upsert(
        {
          app_id: body.appId,
          user_id: normalizedUserId,
          context: nextContext,
          updated_at: updatedAt,
        },
        {
          onConflict: 'user_id,app_id',
        }
      );

    if (upsertError) {
      return NextResponse.json({ error: 'Failed to persist context' }, { status: 500 });
    }

    return NextResponse.json({
      context: nextContext,
      updatedAt,
    });
  } catch {
    return NextResponse.json({ error: 'Unexpected error while updating context' }, { status: 500 });
  }
}

function normalizeUserId(value: string): string {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(value)) {
    return value;
  }
  return stringToDeterministicUuid(value);
}












