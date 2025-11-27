import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_KEYS = new Set<string>([
  'sales.summary',
  'revenue.summary',
  'geography.summary',
  'conversion.summary',
  'retention.summary',
  'cohorts.summary',
  'transactions.summary',
  'payment-methods.summary',
  'refunds.summary',
  'marketing-channels.summary',
]);

export async function GET(
  _req: Request,
  context: { params: { key: string } }
): Promise<Response> {
  const { key } = context.params;

  if (!ALLOWED_KEYS.has(key)) {
    return NextResponse.json(
      { error: 'Analytics key is not allowed' },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error(
      '[Analytics API] Supabase environment variables are not configured'
    );
    return NextResponse.json(
      { error: 'Supabase is not configured on the server' },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data, error } = await supabase
      .from('analytics')
      .select('payload')
      .eq('key', key)
      .single();

    if (error) {
      console.error('[Analytics API] Failed to load analytics payload', {
        key,
        error,
      });
      return NextResponse.json(
        { error: 'Failed to load analytics payload from Supabase' },
        { status: 500 }
      );
    }

    if (!data || typeof data.payload === 'undefined') {
      console.error('[Analytics API] No payload found for key', { key });
      return NextResponse.json(
        { error: 'Analytics payload not found' },
        { status: 404 }
      );
    }

    // Return payload as-is so existing repositories can keep using fromApiResponse
    return NextResponse.json(data.payload);
  } catch (error) {
    console.error('[Analytics API] Unexpected error', { key, error });
    return NextResponse.json(
      { error: 'Unexpected error while loading analytics payload' },
      { status: 500 }
    );
  }
}

