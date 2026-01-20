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
  context: { params: Promise<{ key: string }> }
): Promise<Response> {
  const { key } = await context.params;

  if (!ALLOWED_KEYS.has(key)) {
    return NextResponse.json(
      { error: 'Analytics key is not allowed' },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
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
            return NextResponse.json(
        { error: 'Failed to load analytics payload from Supabase' },
        { status: 500 }
      );
    }

    if (!data || typeof data.payload === 'undefined') {
            return NextResponse.json(
        { error: 'Analytics payload not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data.payload);
  } catch (error) {
        return NextResponse.json(
      { error: 'Unexpected error while loading analytics payload' },
      { status: 500 }
    );
  }
}

