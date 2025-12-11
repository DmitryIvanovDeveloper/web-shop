import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const page = Number(searchParams.get('page') ?? '1');
    const pageSize = Number(searchParams.get('pageSize') ?? '20');
    const campaignId = searchParams.get('campaignId');
    const discountType = searchParams.get('discountType');
    const status = searchParams.get('status');
    const query = searchParams.get('query');

    if (!appId) {
      return NextResponse.json({ error: 'appId query parameter is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const offset = (page - 1) * pageSize;
    let dbQuery = supabase
      .from('promo_codes')
      .select('*', { count: 'exact' })
      .eq('app_id', appId);

    if (campaignId) {
      dbQuery = dbQuery.eq('campaign_id', campaignId);
    }
    if (discountType) {
      dbQuery = dbQuery.eq('discount_type', discountType);
    }
    if (status === 'active') {
      dbQuery = dbQuery.eq('is_active', true);
    }
    if (query) {
      dbQuery = dbQuery.ilike('code', `%${query}%`);
    }

    const { data, error, count } = await dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('[GET /api/merchant-admin/promo-codes] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to load promo codes' }, { status: 500 });
    }

    const items =
      data?.map((row) => ({
        id: row.id,
        appId: row.app_id,
        campaignId: row.campaign_id,
        code: row.code,
        name: row.name,
        description: row.description,
        discountType: row.discount_type,
        discountValue: row.discount_value,
        currency: row.currency,
        isFreeShipping: row.is_free_shipping,
        startAt: row.start_at,
        endAt: row.end_at,
        maxRedemptions: row.max_redemptions,
        maxRedemptionsPerUser: row.max_redemptions_per_user,
        priority: row.priority,
        isExclusive: row.is_exclusive,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })) ?? [];

    return NextResponse.json({
      items,
      total: count ?? items.length,
    });
  } catch (error) {
    console.error('[GET /api/merchant-admin/promo-codes] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to load promo codes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, promoCode } = body;

    if (!appId) {
      return NextResponse.json({ error: 'appId field is required' }, { status: 400 });
    }

    if (!promoCode || !promoCode.code || !promoCode.name) {
      return NextResponse.json(
        { error: 'promoCode.code and promoCode.name are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        id: promoCode.id,
        app_id: appId,
        campaign_id: promoCode.campaignId ?? null,
        code: promoCode.code,
        name: promoCode.name,
        description: promoCode.description ?? null,
        discount_type: promoCode.discountType,
        discount_value: promoCode.discountValue,
        currency: promoCode.currency ?? null,
        is_free_shipping: promoCode.isFreeShipping ?? false,
        start_at: promoCode.startAt ?? null,
        end_at: promoCode.endAt ?? null,
        max_redemptions: promoCode.maxRedemptions ?? null,
        max_redemptions_per_user: promoCode.maxRedemptionsPerUser ?? null,
        priority: promoCode.priority ?? 0,
        is_exclusive: promoCode.isExclusive ?? true,
        is_active: promoCode.isActive ?? true,
        created_at: promoCode.createdAt ?? new Date().toISOString(),
        updated_at: promoCode.updatedAt ?? new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/merchant-admin/promo-codes] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
    }

    const created = {
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

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/merchant-admin/promo-codes] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, promoCode } = body;

    if (!appId) {
      return NextResponse.json({ error: 'appId field is required' }, { status: 400 });
    }

    if (!promoCode || !promoCode.id) {
      return NextResponse.json({ error: 'promoCode.id is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('promo_codes')
      .update({
        campaign_id: promoCode.campaignId ?? null,
        code: promoCode.code,
        name: promoCode.name,
        description: promoCode.description ?? null,
        discount_type: promoCode.discountType,
        discount_value: promoCode.discountValue,
        currency: promoCode.currency ?? null,
        is_free_shipping: promoCode.isFreeShipping ?? false,
        start_at: promoCode.startAt ?? null,
        end_at: promoCode.endAt ?? null,
        max_redemptions: promoCode.maxRedemptions ?? null,
        max_redemptions_per_user: promoCode.maxRedemptionsPerUser ?? null,
        priority: promoCode.priority ?? 0,
        is_exclusive: promoCode.isExclusive ?? true,
        is_active: promoCode.isActive ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', promoCode.id)
      .eq('app_id', appId)
      .select()
      .single();

    if (error) {
      console.error('[PUT /api/merchant-admin/promo-codes] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    const updated = {
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

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/merchant-admin/promo-codes] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 });
  }
}








