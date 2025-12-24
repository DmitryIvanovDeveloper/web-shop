import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check app_configs table
    const { data: configs, error: configError } = await supabase
      .from('app_configs')
      .select('*')
      .eq('app_id', 'APP123');

    if (configError) {
      return NextResponse.json({ error: 'Failed to query app_configs', details: configError }, { status: 500 });
    }

    // Check patch_notes table
    const { data: patchNotes, error: patchNotesError } = await supabase
      .from('patch_notes')
      .select('*')
      .eq('app_id', 'APP123');

    if (patchNotesError) {
      return NextResponse.json({ error: 'Failed to query patch_notes', details: patchNotesError }, { status: 500 });
    }

    // Analyze patch notes by status
    const patchNotesByStatus = {
      total: patchNotes?.length || 0,
      published: patchNotes?.filter(p => p.status === 'published').length || 0,
      draft: patchNotes?.filter(p => p.status === 'draft').length || 0,
      scheduled: patchNotes?.filter(p => p.status === 'scheduled').length || 0
    };

    return NextResponse.json({
      configs: configs || [],
      count: configs?.length || 0,
      hasActiveConfig: configs?.some(c => c.is_active && !c.is_draft) || false,
      patchNotes: patchNotes || [],
      patchNotesByStatus
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}
