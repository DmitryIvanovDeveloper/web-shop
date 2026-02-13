import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';
import { transformSupabaseImageUrl } from '../../../../src/shared/utils/image-url-transformer';

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
            return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

        const offers = data.map((product) => {
            let timer: string | undefined = undefined;
      if (product.expires_at) {
        if (typeof product.expires_at === 'string') {
          timer = product.expires_at;
        } else if (product.expires_at instanceof Date) {
          timer = product.expires_at.toISOString();
        }
      }

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

      const price = typeof product.price === 'number' ? product.price : null;

      return {
        id: product.id,
        mainImage: transformSupabaseImageUrl(product.main_image),
        mainImageAlt: product.main_image_alt,
        sideImage: transformSupabaseImageUrl(product.side_image),
        backgroundImage: transformSupabaseImageUrl(product.background_image),
        includedItems,
        discount: product.discount,
        playerLimit: product.player_limit,
        timer,
        title: product.title,
        rarity: product.rarity,
        originalPrice: price !== null ? String(price) : undefined,
        currentPrice: price !== null ? String(price) : undefined,
        rpBonus: product.rp_bonus,
        lpBonus: product.lp_bonus,
        buyButton: {
          text: price !== null ? `${price.toFixed(2)} $` : 'BUY NOW',
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
        return NextResponse.json(
      { error: 'Unexpected error while loading products' },
      { status: 500 }
    );
  }
}


