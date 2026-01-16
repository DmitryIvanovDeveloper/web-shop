export function transformSupabaseImageUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  // If URL is already proxied or absolute, return as-is
  if (url.startsWith('/api/products/image/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Wrap Supabase storage URL with proxy route to avoid CORS/ORB issues
  // Don't encode the entire URL - Next.js dynamic routes handle path segments automatically
  // Just ensure the path is properly formatted
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  return `/api/products/image/${cleanPath}`;
}

