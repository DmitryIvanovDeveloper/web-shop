// Export environment variables for use in the application
// Next.js automatically loads .env files, no need for dotenv in client-side
export const env = {
  // Server-side only (not available in client)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  // Client-side available (prefixed with NEXT_PUBLIC_)
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_USE_SUPABASE_REVENUE: process.env.NEXT_PUBLIC_USE_SUPABASE_REVENUE,
  NEXT_PUBLIC_USE_SUPABASE_PURCHASE: process.env.NEXT_PUBLIC_USE_SUPABASE_PURCHASE,
};

// Log environment variables status (for debugging)
console.log('[ENV] Environment variables loaded:', {
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
  NEXT_PUBLIC_USE_SUPABASE_REVENUE: env.NEXT_PUBLIC_USE_SUPABASE_REVENUE,
  NEXT_PUBLIC_USE_SUPABASE_PURCHASE: env.NEXT_PUBLIC_USE_SUPABASE_PURCHASE,
  isServer: typeof window === 'undefined',
  isClient: typeof window !== 'undefined'
});
