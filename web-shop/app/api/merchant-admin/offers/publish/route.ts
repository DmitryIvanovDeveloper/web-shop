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

        if (!payload?.appId) {
      return NextResponse.json(
        { error: 'appId field is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

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
            return NextResponse.json(
        { error: 'Timeout while loading scenarios from Supabase. Please try again.' },
        { status: 504 }
      );
    }

    const { data: scenarios, error: loadError } = scenariosResult as Awaited<typeof loadScenariosPromise>;

    if (loadError) {
            return NextResponse.json(
        { error: 'Failed to load scenarios from Supabase', details: loadError.message },
        { status: 500 }
      );
    }

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

    const ruleSetJson = JSON.stringify(ruleTree.ruleSet);
    const ruleSetSizeBytes = Buffer.byteLength(ruleSetJson, 'utf8');
    const scenariosJson = JSON.stringify(ruleTree.scenarios);
    const scenariosSizeBytes = Buffer.byteLength(scenariosJson, 'utf8');

    console.log('Rule tree size statistics:', {
      ruleSetSizeBytes: `${(ruleSetSizeBytes / 1024).toFixed(2)} KB`,
      scenariosSizeBytes: `${(scenariosSizeBytes / 1024).toFixed(2)} KB`,
      metadataSizeBytes: `${((ruleTreeSizeBytes - ruleSetSizeBytes - scenariosSizeBytes) / 1024).toFixed(2)} KB`,
      totalSizeBytes: ruleTreeSizeBytes,
      totalSizeKB: `${ruleTreeSizeKB} KB`,
      totalSizeMB: ruleTreeSizeBytes > 1024 * 1024 ? `${ruleTreeSizeMB} MB` : undefined,
    });

    if (ruleTreeSizeBytes > 10 * 1024 * 1024) {
      console.warn('Rule tree is very large, this may cause performance issues');
    } else if (ruleTreeSizeBytes > 1 * 1024 * 1024) {
      console.warn('Rule tree is large, consider optimizing');
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

        const { error: saveError, data: saveData } = await supabase
      .from('offer_engine_rules')
      .upsert(savePayload, { onConflict: 'app_id' })
      .select();

    if (saveError) {
            return NextResponse.json(
        { error: 'Failed to save rule tree to Supabase', details: saveError.message },
        { status: 500 }
      );
    }

        const response: PublishRuleTreeResponse = {
      ruleTree: {
        version: ruleTree.version,
        generatedAt: ruleTree.generatedAt,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
        return NextResponse.json(
      { error: 'Unexpected error while publishing rule tree' },
      { status: 500 }
    );
  }
};

