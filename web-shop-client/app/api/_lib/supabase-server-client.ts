import { createClient } from '@supabase/supabase-js';

declare const process: { env: Record<string, string | undefined> };

export const getSupabaseServerClient = () => {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const serviceRoleKey =
    process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL or API key is not configured.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        'x-application-name': 'webshop-offers-api',
      },
    },
  });
};













