export function transformSupabaseImageUrl(url: string | null | undefined): string | null {
  if (url == null || url.trim() === '') {
    return null;
  }

  if (
    url.includes('/api/products/image/') ||
    url.includes('http://') ||
    url.includes('https://')
  ) {
    return url;
  }

  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  return `/api/products/image/${cleanPath}`;
}

