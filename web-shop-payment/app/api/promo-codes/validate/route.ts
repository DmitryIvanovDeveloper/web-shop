import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../_lib/supabase-server-client';

interface ValidatePromoCodeRequest {
  code: string;
  appId: string;
  userId?: string;
  orderAmount: number;
  currency: string;
}

interface PromoCodeDto {
  id: string;
  app_id: string;
  campaign_id: string | null;
  code: string;
  name: string;
  description: string | null;
  discount_type: 'percent' | 'fixed_amount';
  discount_value: number;
  currency: string | null;
  is_free_shipping: boolean;
  start_at: string | null;
  end_at: string | null;
  max_redemptions: number | null;
  max_redemptions_per_user: number | null;
  priority: number;
  is_exclusive: boolean;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

interface ValidatePromoCodeResponse {
  isValid: boolean;
  promoCode?: {
    id: string;
    code: string;
    discountType: 'percent' | 'fixed_amount';
    discountValue: number;
    currency: string | null;
    isFreeShipping: boolean;
    campaignId: string | null;
  };
  discountAmount: number;
  finalAmount: number;
  error?: string;
}

/**
 * Validate Promo Code API Route
 * 
 * Validates a promo code and calculates the discount
 * Returns the validated promo code and final amount after discount
 */
export async function POST(request: NextRequest) {
  try {
    const body: ValidatePromoCodeRequest = await request.json();
    const { code, appId, userId, orderAmount, currency } = body;

    // Validate required fields
    if (!code || !appId || !orderAmount || !currency) {
      return NextResponse.json(
        { 
          isValid: false,
          error: 'Missing required fields: code, appId, orderAmount, currency'
        } as ValidatePromoCodeResponse,
        { status: 400 }
      );
    }

    // Validate amount
    if (orderAmount <= 0) {
      return NextResponse.json(
        {
          isValid: false,
          error: 'Order amount must be greater than zero'
        } as ValidatePromoCodeResponse,
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // 1. Load promo code from database (case-insensitive)
    const { data: promoCodeData, error: fetchError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('app_id', appId)
      .ilike('code', code.trim().toUpperCase())
      .single();

    if (fetchError || !promoCodeData) {
      return NextResponse.json({
        isValid: false,
        discountAmount: 0,
        finalAmount: orderAmount,
        error: `Promo code "${code}" not found`
      } as ValidatePromoCodeResponse);
    }

    const promoCode = promoCodeData as PromoCodeDto;

    // 2. Check if code is active
    if (!promoCode.is_active) {
      return NextResponse.json({
        isValid: false,
        discountAmount: 0,
        finalAmount: orderAmount,
        error: `Promo code "${code}" is not active`
      } as ValidatePromoCodeResponse);
    }

    // 3. Check time window (start_at and end_at)
    const now = new Date();
    if (promoCode.start_at) {
      const startAt = new Date(promoCode.start_at);
      if (now < startAt) {
        return NextResponse.json({
          isValid: false,
          discountAmount: 0,
          finalAmount: orderAmount,
          error: `Promo code "${code}" is not yet active`
        } as ValidatePromoCodeResponse);
      }
    }

    if (promoCode.end_at) {
      const endAt = new Date(promoCode.end_at);
      if (now > endAt) {
        return NextResponse.json({
          isValid: false,
          discountAmount: 0,
          finalAmount: orderAmount,
          error: `Promo code "${code}" has expired`
        } as ValidatePromoCodeResponse);
      }
    }

    // 4. Check global redemption limit
    if (promoCode.max_redemptions !== null) {
      const { count: usageCount, error: usageError } = await supabase
        .from('promo_usages')
        .select('*', { count: 'exact', head: true })
        .eq('promo_code_id', promoCode.id);

      if (!usageError && usageCount !== null && usageCount >= promoCode.max_redemptions) {
        return NextResponse.json({
          isValid: false,
          discountAmount: 0,
          finalAmount: orderAmount,
          error: `Promo code "${code}" has reached maximum redemptions`
        } as ValidatePromoCodeResponse);
      }
    }

    // 5. Check per-user redemption limit
    if (userId && promoCode.max_redemptions_per_user !== null) {
      const { count: userUsageCount, error: userUsageError } = await supabase
        .from('promo_usages')
        .select('*', { count: 'exact', head: true })
        .eq('promo_code_id', promoCode.id)
        .eq('user_id', userId);

      if (!userUsageError && userUsageCount !== null && userUsageCount >= promoCode.max_redemptions_per_user) {
        return NextResponse.json({
          isValid: false,
          discountAmount: 0,
          finalAmount: orderAmount,
          error: `You have reached the maximum usage limit for promo code "${code}"`
        } as ValidatePromoCodeResponse);
      }
    }

    // 6. Calculate discount
    let discountAmount = 0;
    if (promoCode.discount_type === 'percent') {
      discountAmount = orderAmount * (promoCode.discount_value / 100);
    } else if (promoCode.discount_type === 'fixed_amount') {
      discountAmount = promoCode.discount_value;
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount);
    const finalAmount = Math.max(0, orderAmount - discountAmount);

    // 7. Return validated promo code
    return NextResponse.json({
      isValid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        discountType: promoCode.discount_type,
        discountValue: promoCode.discount_value,
        currency: promoCode.currency,
        isFreeShipping: promoCode.is_free_shipping,
        campaignId: promoCode.campaign_id
      },
      discountAmount,
      finalAmount
    } as ValidatePromoCodeResponse);

  } catch (error) {
    console.error('[POST /api/promo-codes/validate] Error:', error);
    return NextResponse.json(
      {
        isValid: false,
        discountAmount: 0,
        finalAmount: 0,
        error: error instanceof Error ? error.message : 'Failed to validate promo code'
      } as ValidatePromoCodeResponse,
      { status: 500 }
    );
  }
}











