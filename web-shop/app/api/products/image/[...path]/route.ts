import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Image Proxy Route
 * 
 * Proxies images from Supabase Storage to avoid CORS/ORB issues
 * Usage: /api/products/image/Images/products/filename.png
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Reconstruct the path from the array
    // Path format: Images/products/filename.png -> we need products/filename.png
    let imagePath = params.path.join('/');
    
    // Remove 'Images' prefix if present (bucket name is already specified in .from())
    if (imagePath.startsWith('Images/')) {
      imagePath = imagePath.substring('Images/'.length);
    }
    
    console.log('[Image Proxy] Downloading image', {
      originalPath: params.path.join('/'),
      imagePath,
      bucket: 'Images',
    });
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Download the image from Supabase Storage
    const { data, error } = await supabase.storage
      .from('Images')
      .download(imagePath);

    if (error) {
      console.error('[Image Proxy] Failed to download image', {
        path: imagePath,
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

    // Convert blob to array buffer
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

    // Return the image with proper headers
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
    console.error('[Image Proxy] Unexpected error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

