export function transformSupabaseImageUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  if (
    url.startsWith('/api/products/image/') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  return `/api/products/image/${cleanPath}`;
}

