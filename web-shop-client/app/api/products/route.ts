import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../_lib/supabase-server-client';
import { transformSupabaseImageUrl } from '../../../src/shared/utils/image-url-transformer';
import { container } from '../../../src/infrastructure/bootstrap/container';
import { PRODUCTS_TYPES } from '../../../src/modules/products/infrastructure/bootstrap/types';
import type { PurchaseRepositoryPort } from '../../../src/modules/products/application/ports/purchase-repository.port';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');
    const id = searchParams.get('id');

    const supabase = getSupabaseServerClient();

    let query = supabase.from('products').select('*');

    if (appId) {
      query = query.eq('appid', appId);
    }

    if (id) {
      query = query.eq('id', id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
    }

    if (id && (!data || data.length === 0)) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let purchaseCounts = new Map<string, number>();
    const productsWithLimits =
      data?.filter(
        (item: Record<string, unknown>) =>
          item.player_limit && typeof item.player_limit === 'number' && item.player_limit > 0,
      ) || [];

    if (productsWithLimits.length > 0 && appId) {
      try {
        const purchaseRepository = container.get<PurchaseRepositoryPort>(
          PRODUCTS_TYPES.PurchaseRepository,
        );
        purchaseCounts = await purchaseRepository.getProductPurchaseCounts(appId);
      } catch (error) {
        // ignore purchase count errors; continue without limits
      }
    }

    const products =
      data?.map((item: Record<string, unknown>) => {
        const expiresAt = item.expires_at as string | Date | null | undefined;
        let timer: string | undefined;

        if (expiresAt instanceof Date) {
          timer = expiresAt.toISOString();
        } else if (typeof expiresAt === 'string') {
          timer = expiresAt;
        }

        const priceRaw = item.price as number | null | undefined;
        const price = priceRaw ?? undefined;

        return {
          id: String(item.id ?? ''),
          mainImage: transformSupabaseImageUrl(item.main_image as string | null | undefined),
          backgroundImage: transformSupabaseImageUrl(
            item.background_image as string | null | undefined
          ),
          title: (item.title as string) ?? '',
          titleStyle: (item.title_style as Record<string, unknown> | null) ?? undefined,
          rarity: (item.rarity as string | null) ?? undefined,
          discount:
            item.discount !== null && item.discount !== undefined
              ? String(item.discount)
              : undefined,
          playerLimit:
            item.player_limit !== null && item.player_limit !== undefined
              ? String(item.player_limit)
              : undefined,
          timer,
          price,
          rpBonus: (item.rp_bonus as number | null) ?? undefined,
          lpBonus: (item.lp_bonus as number | null) ?? undefined,
          appid: (item.appid as string) ?? '',
          limitedOffer: (() => {
            const playerLimit = item.player_limit as number | null;
            if (!playerLimit || playerLimit <= 0) {
              return undefined;
            }

            const productId = String(item.id ?? '');
            const purchasedCount = purchaseCounts.get(productId) || 0;
            const limitedOffer = Math.max(0, playerLimit - purchasedCount);

            return limitedOffer > 0 ? limitedOffer : undefined;
          })(),
        };
      }) ?? [];

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected error while loading products' },
      { status: 500 },
    );
  }
}
