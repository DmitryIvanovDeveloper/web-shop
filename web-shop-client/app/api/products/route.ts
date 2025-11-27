import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../_lib/supabase-server-client';
import { transformSupabaseImageUrl } from '../../../src/shared/utils/image-url-transformer';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');

    const supabase = getSupabaseServerClient();

    const query = supabase.from('products').select('*');

    const { data, error } = appId ? await query.eq('appid', appId) : await query;

    if (error) {
      // Server-side log only
      // eslint-disable-next-line no-console
      console.error('[GET /api/products] Supabase error', error);
      return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
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
          originalPrice: (item.original_price as number | null) ?? undefined,
          currentPrice: (item.current_price as number | null) ?? undefined,
          rpBonus: (item.rp_bonus as number | null) ?? undefined,
          lpBonus: (item.lp_bonus as number | null) ?? undefined,
          appid: (item.appid as string) ?? '',
        };
      }) ?? [];

    return NextResponse.json(products);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[GET /api/products] Unexpected error', error);
    return NextResponse.json(
      { error: 'Unexpected error while loading products' },
      { status: 500 }
    );
  }
}


