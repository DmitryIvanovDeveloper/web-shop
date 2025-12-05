import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export const getSupabaseServerClient = (): SupabaseClient => {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('[SupabaseServerClient] NEXT_PUBLIC_SUPABASE_URL is not defined');
  }

  if (!serviceRoleKey) {
    throw new Error('[SupabaseServerClient] SUPABASE_SERVICE_ROLE_KEY is not defined');
  }

  cachedClient = createClient(supabaseUrl, serviceRoleKey);
  return cachedClient;
};

