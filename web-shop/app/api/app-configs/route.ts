import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '../_lib/supabase-server-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json({ error: 'appId parameter is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('app_configs')
      .select('id, app_id, version, is_active, is_draft, created_at, updated_at')
      .eq('app_id', appId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[GET /api/app-configs] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to load app configs' }, { status: 500 });
    }

    return NextResponse.json({ appConfigs: data ?? [] });
  } catch (error) {
    console.error('[GET /api/app-configs] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to load app configs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, name, config } = body;

    if (!appId) {
      return NextResponse.json({ error: 'appId is required' }, { status: 400 });
    }

    if (!config) {
      return NextResponse.json({ error: 'Config is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('app_configs')
      .insert({
        app_id: appId,
        merchant_id: 'user', // Для не-админов
        config: config,
        version: 1,
        is_active: false, // Сохраненные configs не активны по умолчанию
        is_draft: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/app-configs] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save app config' }, { status: 500 });
    }

    return NextResponse.json({ appConfig: data });
  } catch (error) {
    console.error('[POST /api/app-configs] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to save app config' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, config } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // First get existing config to merge metadata if needed
    const { data: existing, error: fetchError } = await supabase
      .from('app_configs')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('[PUT /api/app-configs] Fetch error:', fetchError);
      return NextResponse.json({ error: 'App config not found' }, { status: 404 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (config !== undefined) updateData.config = config;
    // Note: name field not supported in current schema

    const { data, error } = await supabase
      .from('app_configs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[PUT /api/app-configs] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update app config' }, { status: 500 });
    }

    return NextResponse.json({ appConfig: data });
  } catch (error) {
    console.error('[PUT /api/app-configs] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to update app config' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from('app_configs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DELETE /api/app-configs] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to delete app config' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/app-configs] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to delete app config' }, { status: 500 });
  }
}
