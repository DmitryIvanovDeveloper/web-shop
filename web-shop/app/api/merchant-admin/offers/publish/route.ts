import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';
import type {
  OfferScenarioDto,
  PublishRuleTreeRequest,
  PublishRuleTreeResponse,
} from '../../../../../src/modules/merchant-admin/offers/application/dtos/offer-scenarios.dto';
import { buildOfferRuleTreeFromCatalog } from '../../../../../src/modules/merchant-admin/offers/domain/services';

interface OfferScenarioRow {
  app_id: string;
  slug: string;
  priority: number | null;
  tags: string[] | null;
  configuration: OfferScenarioDto['configuration'] | null;
  updated_at: string;
}

const mapRowsToOverrides = (rows: OfferScenarioRow[]) => {
  return rows.reduce<Record<string, { priority?: number; tags?: readonly string[]; configuration?: OfferScenarioDto['configuration'] }>>(
    (acc, row) => {
      acc[row.slug] = {
        priority: row.priority ?? undefined,
        tags: row.tags ?? undefined,
        configuration:
          row.configuration ??
          {
            offerIds: [row.slug],
            items: [],
            metadata: {},
          },
      };
      return acc;
    },
    {}
  );
};

export const POST = async (request: NextRequest) => {
  try {
    const payload = (await request.json()) as PublishRuleTreeRequest;

    console.log('[POST /merchant-admin/offers/publish] Received payload:', {
      appId: payload?.appId,
      hasRuleTree: !!payload?.ruleTree,
    });

    if (!payload?.appId) {
      return NextResponse.json(
        { error: 'appId field is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    console.log('[POST /merchant-admin/offers/publish] Loading scenarios from Supabase for appId:', payload.appId);

    // Add timeout wrapper for Supabase query
    const loadScenariosPromise = supabase
      .from('offer_scenarios')
      .select('app_id, slug, priority, tags, configuration, updated_at')
      .eq('app_id', payload.appId);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase query timeout after 10 seconds')), 10000)
    );

    let scenariosResult;
    try {
      scenariosResult = await Promise.race([loadScenariosPromise, timeoutPromise]);
    } catch (timeoutError) {
      console.error('[POST /merchant-admin/offers/publish] Supabase query timeout', timeoutError);
      return NextResponse.json(
        { error: 'Timeout while loading scenarios from Supabase. Please try again.' },
        { status: 504 }
      );
    }

    const { data: scenarios, error: loadError } = scenariosResult as Awaited<typeof loadScenariosPromise>;

    if (loadError) {
      console.error('[POST /merchant-admin/offers/publish] Failed to load scenarios', loadError);
      return NextResponse.json(
        { error: 'Failed to load scenarios from Supabase', details: loadError.message },
        { status: 500 }
      );
    }

    console.log('[POST /merchant-admin/offers/publish] Loaded scenarios count:', scenarios?.length ?? 0);

    const ruleTree =
      payload.ruleTree ??
      buildOfferRuleTreeFromCatalog({
        appId: payload.appId,
        version: `v${Date.now()}`,
        overrides: mapRowsToOverrides(scenarios),
      });

    const ruleTreeJson = JSON.stringify(ruleTree);
    const ruleTreeSizeBytes = Buffer.byteLength(ruleTreeJson, 'utf8');
    const ruleTreeSizeKB = (ruleTreeSizeBytes / 1024).toFixed(2);
    const ruleTreeSizeMB = (ruleTreeSizeBytes / (1024 * 1024)).toFixed(2);

    console.log('[POST /merchant-admin/offers/publish] Built rule tree:', {
      appId: ruleTree.appId,
      version: ruleTree.version,
      generatedAt: ruleTree.generatedAt,
      scenariosCount: ruleTree.scenarios.length,
      ruleTreeSizeBytes,
      ruleTreeSizeKB: `${ruleTreeSizeKB} KB`,
      ruleTreeSizeMB: ruleTreeSizeBytes > 1024 * 1024 ? `${ruleTreeSizeMB} MB` : undefined,
    });

    // Detailed structure analysis
    const ruleSetJson = JSON.stringify(ruleTree.ruleSet);
    const ruleSetSizeBytes = Buffer.byteLength(ruleSetJson, 'utf8');
    const scenariosJson = JSON.stringify(ruleTree.scenarios);
    const scenariosSizeBytes = Buffer.byteLength(scenariosJson, 'utf8');

    console.log('[POST /merchant-admin/offers/publish] Rule tree structure breakdown:', {
      ruleSetSizeBytes: `${(ruleSetSizeBytes / 1024).toFixed(2)} KB`,
      scenariosSizeBytes: `${(scenariosSizeBytes / 1024).toFixed(2)} KB`,
      metadataSizeBytes: `${((ruleTreeSizeBytes - ruleSetSizeBytes - scenariosSizeBytes) / 1024).toFixed(2)} KB`,
      totalSizeBytes: ruleTreeSizeBytes,
      totalSizeKB: `${ruleTreeSizeKB} KB`,
      totalSizeMB: ruleTreeSizeBytes > 1024 * 1024 ? `${ruleTreeSizeMB} MB` : undefined,
    });

    // Warn if rule tree is very large (Supabase JSONB has practical limits)
    if (ruleTreeSizeBytes > 10 * 1024 * 1024) {
      console.warn('[POST /merchant-admin/offers/publish] WARNING: Rule tree is very large (>10MB), this may cause performance issues');
    } else if (ruleTreeSizeBytes > 1 * 1024 * 1024) {
      console.warn('[POST /merchant-admin/offers/publish] WARNING: Rule tree is large (>1MB), consider optimizing');
    }

    const savePayload = {
      app_id: ruleTree.appId,
      version: ruleTree.version,
      rule_tree: ruleTree,
      updated_at: new Date().toISOString(),
    };

    const payloadJson = JSON.stringify(savePayload);
    const payloadSizeBytes = Buffer.byteLength(payloadJson, 'utf8');
    const payloadSizeKB = (payloadSizeBytes / 1024).toFixed(2);

    console.log('[POST /merchant-admin/offers/publish] Saving to Supabase:', {
      app_id: savePayload.app_id,
      version: savePayload.version,
      updated_at: savePayload.updated_at,
      payloadSizeBytes,
      payloadSizeKB: `${payloadSizeKB} KB`,
    });

    const { error: saveError, data: saveData } = await supabase
      .from('offer_engine_rules')
      .upsert(savePayload, { onConflict: 'app_id' })
      .select();

    if (saveError) {
      console.error('[POST /merchant-admin/offers/publish] Failed to save rule tree', saveError);
      return NextResponse.json(
        { error: 'Failed to save rule tree to Supabase', details: saveError.message },
        { status: 500 }
      );
    }

    console.log('[POST /merchant-admin/offers/publish] Successfully saved rule tree:', saveData);

    const response: PublishRuleTreeResponse = {
      ruleTree: {
        version: ruleTree.version,
        generatedAt: ruleTree.generatedAt,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[POST /merchant-admin/offers/publish] Unexpected error', error);
    return NextResponse.json(
      { error: 'Unexpected error while publishing rule tree' },
      { status: 500 }
    );
  }
};








