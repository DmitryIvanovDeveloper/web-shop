import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required. Please specify ?appId=YOUR_APP_ID in the URL.' },
        { status: 400 }
      );
    }

    // Show all patch notes by default for client testing, only published for production
    const statusFilter = searchParams.get('status') || 'all';

    let query = supabase
      .from('patch_notes')
      .select('*')
      .eq('app_id', appId);

    if (statusFilter === 'published') {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/patch-notes/published] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('[GET /api/patch-notes/published] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
