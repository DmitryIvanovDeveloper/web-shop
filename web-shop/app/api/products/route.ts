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
            return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
    }

    return NextResponse.json({ products: data ?? [] });
  } catch (error) {
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

    if (product.main_image && product.main_image.startsWith('data:')) {
      const base64Length = product.main_image.length;

      const maxBase64Length = 10 * 1024 * 1024; 
      if (base64Length > maxBase64Length) {
        return NextResponse.json(
          { error: 'Image is too large. Maximum size is 2MB.' },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseServerClient();

    if (product.main_image) {
      const imageSize = product.main_image.length;
            if (product.main_image.startsWith('data:')) {
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
            return NextResponse.json(
        { error: 'Failed to create product', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
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

    if (product.main_image && product.main_image.startsWith('data:')) {
      const base64Length = product.main_image.length;

      const maxBase64Length = 10 * 1024 * 1024; 
      if (base64Length > maxBase64Length) {
        return NextResponse.json(
          { error: 'Image is too large. Maximum size is 2MB.' },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseServerClient();

    if (product.main_image) {
      if (product.main_image.startsWith('data:')) {
        const imageSize = product.main_image.length;
        // TODO: Process base64 image data
      } else if (product.main_image.startsWith('http')) {
        // TODO: Process external image URL
      } else {
        // TODO: Process local image path
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
            return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}