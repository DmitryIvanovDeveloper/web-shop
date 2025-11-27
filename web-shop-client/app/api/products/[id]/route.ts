import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';
import { transformSupabaseImageUrl } from '../../../../src/shared/utils/image-url-transformer';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      
      console.error('[GET /api/products/[id]] Failed to load product:', error);
      return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Map database fields to Offer format
    // Handle timer: convert Date/string to ISO string if needed
    let timer: string | undefined = undefined;
    if (data.expires_at) {
      if (typeof data.expires_at === 'string') {
        timer = data.expires_at;
      } else if (data.expires_at instanceof Date) {
        timer = data.expires_at.toISOString();
      }
    }

    // Handle includedItems: ensure it's an array
    let includedItems: string[] | undefined = undefined;
    if (data.included_items) {
      if (Array.isArray(data.included_items)) {
        includedItems = data.included_items;
      } else if (typeof data.included_items === 'string') {
        try {
          includedItems = JSON.parse(data.included_items);
        } catch {
          includedItems = [data.included_items];
        }
      }
    }

    const offer = {
      id: data.id,
      mainImage: transformSupabaseImageUrl(data.main_image),
      mainImageAlt: data.main_image_alt,
      sideImage: transformSupabaseImageUrl(data.side_image),
      backgroundImage: transformSupabaseImageUrl(data.background_image),
      includedItems,
      discount: data.discount,
      playerLimit: data.player_limit,
      timer,
      title: data.title,
      rarity: data.rarity,
      originalPrice: data.price ? String(data.price) : undefined,
      currentPrice: data.price ? String(data.price) : undefined,
      rpBonus: data.rp_bonus,
      lpBonus: data.lp_bonus,
      buyButton: {
        text: 'Buy',
        enabled: true,
        style: {
          backgroundColor: 'rgb(255, 215, 0)',
          textColor: '#000000',
          borderRadius: '8px',
          padding: '12px 24px',
          fontWeight: 'bold',
        },
      },
    };

    return NextResponse.json(offer);
  } catch (error) {
    console.error('[GET /api/products/[id]] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Unexpected error while loading product' },
      { status: 500 }
    );
  }
}
