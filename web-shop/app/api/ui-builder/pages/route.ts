import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('page_configs')
      .select('page_slug')
      .eq('app_id', appId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const pageSlugs: string[] = Array.from(
      new Set(
        (data || []).map((row: { page_slug: string }) => row.page_slug as string)
      )
    );

    return NextResponse.json(
      { pages: pageSlugs },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

