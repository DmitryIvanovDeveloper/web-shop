import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json(
        { error: 'appId query parameter is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('app_configs_grape')
      .select('*')
      .eq('app_id', appId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Unexpected error in GET /api/app-builder/config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    if (!body.app_id || !body.merchant_id) {
      return NextResponse.json(
        { error: 'app_id and merchant_id are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Deactivate existing configs for this app
    await supabase
      .from('app_configs_grape')
      .update({ is_active: false })
      .eq('app_id', body.app_id)
      .eq('is_active', true);

    // Insert new config
    const { data, error } = await supabase
      .from('app_configs_grape')
      .insert([
        {
          app_id: body.app_id,
          merchant_id: body.merchant_id,
          config: body.config || {},
          draft_config: body.draft_config || {},
          version: body.version || 1,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/app-builder/config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.config !== undefined) updateData.config = body.config;
    if (body.draft_config !== undefined) updateData.draft_config = body.draft_config;
    if (body.version !== undefined) updateData.version = body.version;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data, error } = await supabase
      .from('app_configs_grape')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in PUT /api/app-builder/config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
