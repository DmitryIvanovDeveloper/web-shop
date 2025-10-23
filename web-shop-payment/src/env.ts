// Export environment variables for use in the application
// Next.js automatically loads .env files, no need for dotenv in client-side
export const env = {
  // Server-side only (not available in client)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  // Client-side available (prefixed with NEXT_PUBLIC_)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

// Log environment variables status (for debugging)
console.log('[ENV] Environment variables loaded:', {
  STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
  isServer: typeof window === 'undefined',
  isClient: typeof window !== 'undefined'
});
