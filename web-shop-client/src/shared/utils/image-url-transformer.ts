export function transformSupabaseImageUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  // If URL is already proxied or absolute, return as-is
  if (url.startsWith('/api/products/image/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Wrap Supabase storage URL with proxy route to avoid CORS/ORB issues
  return `/api/products/image/${encodeURIComponent(url)}`;
}

