import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '../../../_lib/supabase-server-client';
import type {
  ListOfferScenariosResponse,
  OfferScenarioDto,
  UpdateOfferScenarioRequest,
} from '../../../../../src/modules/merchant-admin/offers/application/dtos/offer-scenarios.dto';

interface OfferScenarioRow {
  app_id: string;
  slug: string;
  priority: number | null;
  tags: string[] | null;
  configuration: OfferScenarioDto['configuration'] | null;
  updated_at: string;
}

const mapRowToDto = (row: OfferScenarioRow): OfferScenarioDto => ({
  slug: row.slug,
  priority: row.priority ?? 0,
  tags: row.tags ?? [],
  configuration: row.configuration ?? {
    offerIds: [row.slug],
    items: [],
    metadata: {},
  },
});

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
    const { data, error } = await supabase
      .from('offer_scenarios')
      .select('app_id, slug, priority, tags, configuration, updated_at')
      .eq('app_id', appId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to load scenarios from Supabase' },
        { status: 500 }
      );
    }

    const rows = (data as OfferScenarioRow[] | null) ?? [];
    const response: ListOfferScenariosResponse = {
      scenarios: rows.map(mapRowToDto),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
        return NextResponse.json(
      { error: 'Unexpected error while loading scenarios' },
      { status: 500 }
    );
  }
};

export const PUT = async (request: NextRequest) => {
  try {
    const payload = (await request.json()) as UpdateOfferScenarioRequest;

    if (!payload?.appId) {
      return NextResponse.json(
        { error: 'appId field is required' },
        { status: 400 }
      );
    }

    if (!payload.scenario) {
      return NextResponse.json(
        { error: 'scenario field is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('offer_scenarios')
      .upsert(
        {
          app_id: payload.appId,
          slug: payload.scenario.slug,
          priority: payload.scenario.priority,
          tags: payload.scenario.tags,
          configuration: payload.scenario.configuration,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'app_id,slug' }
      );

    if (error) {
            return NextResponse.json(
        { error: 'Failed to save scenario to Supabase' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
        return NextResponse.json(
      { error: 'Unexpected error while saving scenario' },
      { status: 500 }
    );
  }
};

