import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';
import type { OfferRuleTree } from '../../../../../src/modules/merchant-admin/offers/domain/types/offer-rule-tree.type';

interface OfferEngineRulesRow {
  app_id: string;
  version: string;
  rule_tree: OfferRuleTree;
  updated_at: string;
}

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json(
        { error: 'appId query parameter is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    
    console.log('[GET /merchant-admin/offers/rules] Loading rule tree from Supabase for appId:', appId);

    const { data, error } = await supabase
      .from('offer_engine_rules')
      .select('app_id, version, rule_tree, updated_at')
      .eq('app_id', appId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no rule tree found, return null (not an error)
      if (error.code === 'PGRST116') {
        console.log('[GET /merchant-admin/offers/rules] No rule tree found for appId:', appId);
        return NextResponse.json({ ruleTree: null }, { status: 200 });
      }

      console.error('[GET /merchant-admin/offers/rules] Failed to load rule tree', error);
      return NextResponse.json(
        { error: 'Failed to load rule tree from Supabase', details: error.message },
        { status: 500 }
      );
    }

    const row = data as OfferEngineRulesRow | null;
    const ruleTree = row?.rule_tree ?? null;

    console.log('[GET /merchant-admin/offers/rules] Rule tree loaded:', {
      appId,
      hasRuleTree: !!ruleTree,
      version: ruleTree?.version,
      generatedAt: ruleTree?.generatedAt,
    });

    return NextResponse.json({ ruleTree }, { status: 200 });
  } catch (error) {
    console.error('[GET /merchant-admin/offers/rules] Unexpected error', error);
    return NextResponse.json(
      { error: 'Unexpected error while loading rule tree' },
      { status: 500 }
    );
  }
};

