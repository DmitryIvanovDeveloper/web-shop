import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '../_lib/supabase-server-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json({ error: 'appId query parameter is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('appid', appId)
      .order('title', { ascending: true });

    if (error) {
      console.error('[GET /api/products] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
    }

    return NextResponse.json({ products: data ?? [] });
  } catch (error) {
    console.error('[GET /api/products] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, product } = body;

    if (!appId) {
      return NextResponse.json({ error: 'appId field is required' }, { status: 400 });
    }

    if (!product || !product.title) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    // Check if main_image is base64 and validate size
    if (product.main_image && product.main_image.startsWith('data:')) {
      const base64Length = product.main_image.length;
      // Base64 increases size by ~33%, so 2MB file becomes ~2.67MB string
      // PostgreSQL text field can handle up to ~1GB, but we'll limit to 10MB for safety
      const maxBase64Length = 10 * 1024 * 1024; // 10MB
      if (base64Length > maxBase64Length) {
        return NextResponse.json(
          { error: 'Image is too large. Maximum size is 2MB.' },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseServerClient();

    // Log main_image size for debugging
    if (product.main_image) {
      const imageSize = product.main_image.length;
      console.log('[POST /api/products] main_image size:', imageSize, 'bytes');
      if (product.main_image.startsWith('data:')) {
        console.log('[POST /api/products] main_image is base64 data URL');
      }
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        id: product.id,
        title: product.title,
        description: product.description ?? null,
        appid: appId,
        main_image: product.main_image ?? null,
        background_image: product.background_image ?? null,
        rarity: product.rarity ?? null,
        discount: product.discount ?? null,
        player_limit: product.player_limit ?? null,
        limited_offer: product.limited_offer ?? null,
        expires_at: product.expires_at ?? null,
        price: product.price ?? null,
        rp_bonus: product.rp_bonus ?? null,
        lp_bonus: product.lp_bonus ?? null,
        created_at: product.created_at ?? new Date().toISOString(),
        updated_at: product.updated_at ?? new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/products] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create product', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[POST /api/products] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, id, product } = body;

    if (!appId) {
      return NextResponse.json({ error: 'appId field is required' }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: 'id field is required' }, { status: 400 });
    }

    if (!product || !product.title) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    // Check if main_image is base64 and validate size
    if (product.main_image && product.main_image.startsWith('data:')) {
      const base64Length = product.main_image.length;
      // Base64 increases size by ~33%, so 2MB file becomes ~2.67MB string
      // PostgreSQL text field can handle up to ~1GB, but we'll limit to 10MB for safety
      const maxBase64Length = 10 * 1024 * 1024; // 10MB
      if (base64Length > maxBase64Length) {
        return NextResponse.json(
          { error: 'Image is too large. Maximum size is 2MB.' },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseServerClient();

    // Log main_image for debugging
    if (product.main_image) {
      if (product.main_image.startsWith('data:')) {
        const imageSize = product.main_image.length;
        console.log('[PUT /api/products] main_image is base64 data URL, size:', imageSize, 'bytes');
      } else if (product.main_image.startsWith('http')) {
        console.log('[PUT /api/products] main_image is URL:', product.main_image);
      } else {
        console.log('[PUT /api/products] main_image value:', product.main_image.substring(0, 100));
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        title: product.title,
        description: product.description ?? null,
        main_image: product.main_image ?? null,
        background_image: product.background_image ?? null,
        rarity: product.rarity ?? null,
        discount: product.discount ?? null,
        player_limit: product.player_limit ?? null,
        limited_offer: product.limited_offer ?? null,
        expires_at: product.expires_at ?? null,
        price: product.price ?? null,
        rp_bonus: product.rp_bonus ?? null,
        lp_bonus: product.lp_bonus ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('appid', appId)
      .select()
      .single();

    if (error) {
      console.error('[PUT /api/products] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update product', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/products] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const appId = searchParams.get('appId');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    if (!appId) {
      return NextResponse.json({ error: 'appId query parameter is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('appid', appId);

    if (error) {
      console.error('[DELETE /api/products] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/products] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}