/**
 * Image URL Transformer
 * 
 * Transforms Supabase Storage URLs to proxy URLs to avoid CORS/ORB issues
 */

/**
 * Transforms a Supabase Storage URL to a proxy URL
 * 
 * @param url - Original Supabase Storage URL or null/undefined
 * @returns Proxy URL or undefined if input is invalid
 * 
 * @example
 * transformSupabaseImageUrl('https://xxx.supabase.co/storage/v1/object/public/Images/products/file.png')
 * // Returns: '/api/products/image/Images/products/file.png'
 */
export function transformSupabaseImageUrl(
  url: string | null | undefined
): string | undefined {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return undefined;
  }

  const trimmedUrl = url.trim();

  // Check if URL is a Supabase Storage public URL
  // Format: https://xxx.supabase.co/storage/v1/object/public/Images/path/to/file.png
  const supabaseStoragePattern = /\/storage\/v1\/object\/public\/(.+)$/;
  const match = trimmedUrl.match(supabaseStoragePattern);

  if (!match) {
    // Not a Supabase Storage URL, return as-is
    return trimmedUrl;
  }

  // Extract the path after /storage/v1/object/public/
  // This includes the bucket name (Images) and the file path
  const storagePath = match[1];

  // Construct proxy URL
  const proxyUrl = `/api/products/image/${storagePath}`;

  return proxyUrl;
}

