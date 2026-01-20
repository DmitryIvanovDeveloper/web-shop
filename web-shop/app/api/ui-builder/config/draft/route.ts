import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json({ error: 'appId is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('app_configs')
      .select('id, app_id, merchant_id, version, is_active, is_draft, config, created_at')
      .eq('app_id', appId)
      .eq('is_draft', true)
      .order('version', { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ config: null }, { status: 200 });
    }

    return NextResponse.json({ config: data[0] }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as {
      appId: string;
      merchantId?: string;
      config: unknown;
    };

    if (!body.appId || !body.config) {
      return NextResponse.json(
        { error: 'appId and config are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: existingDraft } = await supabase
      .from('app_configs')
      .select('id, version')
      .eq('app_id', body.appId)
      .eq('is_draft', true)
      .order('version', { ascending: false })
      .limit(1);

    const newVersion =
      existingDraft && Array.isArray(existingDraft) && existingDraft.length > 0
        ? (existingDraft[0].version as number) + 1
        : 1;

    if (existingDraft && Array.isArray(existingDraft) && existingDraft.length > 0) {
      const { error } = await supabase
        .from('app_configs')
        .update({
          version: newVersion,
          config: body.config,
          is_active: false,
          is_draft: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDraft[0].id);

      if (error) {
        return NextResponse.json(
          { error: `Failed to update draft: ${error.message}` },
          { status: 500 }
        );
      }
    } else {
      const { error } = await supabase
        .from('app_configs')
        .insert({
          app_id: body.appId,
          merchant_id: body.merchantId ?? null,
          version: newVersion,
          is_active: false,
          is_draft: true,
          config: body.config,
        });

      if (error) {
        return NextResponse.json(
          { error: `Failed to insert draft: ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, version: newVersion }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

