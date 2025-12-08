import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const appId = searchParams.get('appId');

  if (!productId) {
    return NextResponse.json({ error: 'productId query parameter is required' }, { status: 400 });
  }

  if (!appId) {
    return NextResponse.json({ error: 'appId query parameter is required' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('products')
      .select('id,title,price')
      .eq('id', productId)
      .eq('appid', appId)
      .single();

    if (error?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (error) {
      console.error('[GET /api/products/by-id] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const mapped = {
      id: data.id,
      title: data.title,
      price: Number(data.price),
      currency: 'USD',
    };

    if (!Number.isFinite(mapped.price) || mapped.price <= 0) {
      return NextResponse.json({ error: 'Invalid product price' }, { status: 500 });
    }

    return NextResponse.json({ product: mapped }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/products/by-id] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
  }
}

