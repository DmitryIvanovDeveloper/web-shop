import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '../_lib/supabase-server-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const supabase = getSupabaseServerClient();

    let query = supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[GET /api/templates] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 });
    }

    return NextResponse.json({ templates: data ?? [] });
  } catch (error) {
    console.error('[GET /api/templates] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, appConfig, pages } = body;

    if (!name) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    if (!appConfig) {
      return NextResponse.json({ error: 'App config is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('templates')
      .insert({
        name,
        app_config: appConfig,
        page_configs: pages || [],
        metadata: description ? { description } : {},
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/templates] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create template', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[POST /api/templates] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, appConfig, pages, isActive } = body;

    console.log('[PUT /api/templates] Received request:', { id, name, description, hasAppConfig: !!appConfig, hasPages: !!pages, isActive });

    if (!id) {
      return NextResponse.json({ error: 'Template id is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (appConfig !== undefined) updateData.app_config = appConfig;
    if (pages !== undefined) updateData.page_configs = pages;
    if (isActive !== undefined) updateData.is_active = isActive;

    // Handle metadata updates properly - merge with existing metadata
    if (description !== undefined) {
      // First get current template to merge metadata
      const { data: currentTemplate } = await supabase
        .from('templates')
        .select('metadata')
        .eq('id', id)
        .single();

      updateData.metadata = {
        ...(currentTemplate?.metadata || {}),
        description,
      };
    }

    console.log('[PUT /api/templates] Updating template with data:', updateData);

    const { data, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[PUT /api/templates] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update template', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    console.log('[PUT /api/templates] Template updated successfully:', data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/templates] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DELETE /api/templates] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/templates] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
