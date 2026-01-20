import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as {
      appId: string;
      draftVersion?: number;
    };

    if (!body.appId) {
      return NextResponse.json({ error: 'appId is required' }, { status: 400 });
    }

    const appId = body.appId;
    const draftVersion = body.draftVersion ?? 0;

    const supabase = getSupabaseServerClient();

    let draftData: any;

    if (draftVersion > 0) {
      const { data, error: draftError } = await supabase
        .from('app_configs')
        .select('id, config, version')
        .eq('app_id', appId)
        .eq('version', draftVersion)
        .eq('is_draft', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (draftError) {
        return NextResponse.json(
          { error: `Draft not found: ${draftError.message}` },
          { status: 404 }
        );
      }

      if (!data || (Array.isArray(data) && data.length === 0)) {
        return NextResponse.json(
          { error: `Draft not found for appId: ${appId}, version: ${draftVersion}` },
          { status: 404 }
        );
      }

      draftData = Array.isArray(data) ? data[0] : data;
    } else {
      const { data, error: draftError } = await supabase
        .from('app_configs')
        .select('id, config, version')
        .eq('app_id', appId)
        .eq('is_draft', true)
        .order('version', { ascending: false })
        .limit(1);

      if (draftError || !data || data.length === 0) {
        return NextResponse.json(
          { error: `No draft found: ${draftError?.message ?? 'not found'}` },
          { status: 404 }
        );
      }

      draftData = data[0];
    }

    const { error: deactivateError } = await supabase
      .from('app_configs')
      .update({ is_active: false })
      .eq('app_id', appId)
      .eq('is_active', true);

    if (deactivateError) {
      return NextResponse.json(
        { error: `Failed to deactivate active configs: ${deactivateError.message}` },
        { status: 500 }
      );
    }

    const { error: activateError } = await supabase
      .from('app_configs')
      .update({
        is_active: true,
        is_draft: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', draftData.id);

    if (activateError) {
      return NextResponse.json(
        { error: `Failed to activate draft: ${activateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, config: draftData.config }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

