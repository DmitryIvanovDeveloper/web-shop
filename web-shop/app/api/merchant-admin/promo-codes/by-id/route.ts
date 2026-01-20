import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('id', id)
      .limit(1)
      .single();

    if (error) {
      if ((error as { code?: string }).code === 'PGRST116') {
        
        return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
      }
            return NextResponse.json({ error: 'Failed to load promo code' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    const dto = {
      id: data.id,
      appId: data.app_id,
      campaignId: data.campaign_id,
      code: data.code,
      name: data.name,
      description: data.description,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      currency: data.currency,
      isFreeShipping: data.is_free_shipping,
      startAt: data.start_at,
      endAt: data.end_at,
      maxRedemptions: data.max_redemptions,
      maxRedemptionsPerUser: data.max_redemptions_per_user,
      priority: data.priority,
      isExclusive: data.is_exclusive,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json(dto, { status: 200 });
  } catch (error) {
        return NextResponse.json({ error: 'Failed to load promo code' }, { status: 500 });
  }
}

