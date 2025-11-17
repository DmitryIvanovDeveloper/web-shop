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

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('products')
      .insert({
        id: product.id,
        title: product.title,
        appid: appId,
        main_image: product.main_image ?? null,
        background_image: product.background_image ?? null,
        rarity: product.rarity ?? null,
        discount: product.discount ?? null,
        player_limit: product.player_limit ?? null,
        expires_at: product.expires_at ?? null,
        original_price: product.original_price ?? null,
        current_price: product.current_price ?? null,
        rp_bonus: product.rp_bonus ?? null,
        lp_bonus: product.lp_bonus ?? null,
        created_at: product.created_at ?? new Date().toISOString(),
        updated_at: product.updated_at ?? new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/products] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
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

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('products')
      .update({
        title: product.title,
        main_image: product.main_image ?? null,
        background_image: product.background_image ?? null,
        rarity: product.rarity ?? null,
        discount: product.discount ?? null,
        player_limit: product.player_limit ?? null,
        expires_at: product.expires_at ?? null,
        original_price: product.original_price ?? null,
        current_price: product.current_price ?? null,
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
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
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











