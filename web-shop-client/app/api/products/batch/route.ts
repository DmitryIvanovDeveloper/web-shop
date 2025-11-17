import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { ids } = body as { ids?: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', ids);

    if (error) {
      console.error('[POST /api/products/batch] Supabase error', error);
      return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Map database fields to Offer format
    const offers = data.map((product) => {
      // Handle timer: convert Date/string to ISO string if needed
      let timer: string | undefined = undefined;
      if (product.expires_at) {
        if (typeof product.expires_at === 'string') {
          timer = product.expires_at;
        } else if (product.expires_at instanceof Date) {
          timer = product.expires_at.toISOString();
        }
      }

      // Handle includedItems: ensure it's an array
      let includedItems: string[] | undefined = undefined;
      if (product.included_items) {
        if (Array.isArray(product.included_items)) {
          includedItems = product.included_items;
        } else if (typeof product.included_items === 'string') {
          try {
            includedItems = JSON.parse(product.included_items);
          } catch {
            includedItems = [product.included_items];
          }
        }
      }

      return {
        id: product.id,
        mainImage: product.main_image,
        mainImageAlt: product.main_image_alt,
        sideImage: product.side_image,
        backgroundImage: product.background_image,
        includedItems,
        discount: product.discount,
        playerLimit: product.player_limit,
        timer,
        title: product.title,
        rarity: product.rarity,
        originalPrice: product.price ? String(product.price) : undefined,
        currentPrice: product.price ? String(product.price) : undefined,
        rpBonus: product.rp_bonus,
        lpBonus: product.lp_bonus,
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
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error('[POST /api/products/batch] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Unexpected error while loading products' },
      { status: 500 }
    );
  }
}

