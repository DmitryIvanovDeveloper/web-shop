import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Image Proxy Route (web-shop-client)
 *
 * Proxies images from Supabase Storage to avoid CORS/ORB issues on the client app.
 * Usage example:
 *   /api/products/image/Images/products/filename.png
 *
 * The path part after `/api/products/image/` is treated as the original
 * Supabase Storage path. If it starts with `Images/`, this prefix is removed,
 * because the bucket name is already specified when calling `.from('Images')`.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<Response> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Reconstruct the path from the array
    let imagePath = params.path.join('/');

    // Remove 'Images' prefix if present (bucket name is already provided in .from())
    if (imagePath.startsWith('Images/')) {
      imagePath = imagePath.substring('Images/'.length);
    }

    // Create Supabase client using service role key (server-side only)
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Download the image from Supabase Storage
    const { data, error } = await supabase.storage
      .from('Images')
      .download(imagePath);

    if (error) {
      console.error('[Client Image Proxy] Failed to download image', {
        originalPath: params.path.join('/'),
        imagePath,
        error: error.message,
      });
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Image data is empty' },
        { status: 404 }
      );
    }

    const arrayBuffer = await data.arrayBuffer();

    // Determine content type from file extension
    const extension = imagePath.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    };
    const contentType = contentTypes[extension || ''] || 'image/jpeg';

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('[Client Image Proxy] Unexpected error', {
      originalPath: params.path?.join('/') ?? '',
      error,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}












