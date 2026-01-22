import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../_lib/supabase-server-client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    console.log('API publish called with params.id:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'Config ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // 1. Получить полную информацию о конфигурации для публикации
    const { data: configToPublish, error: getError } = await supabase
      .from('app_configs_grape')
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !configToPublish) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // 2. Деактивировать все другие конфигурации для этого app_id
    await supabase
      .from('app_configs_grape')
      .update({ is_active: false })
      .eq('app_id', configToPublish.app_id)
      .neq('id', id);

    // 3. Найти максимальную версию для этого app_id и установить новую версию
    const { data: maxVersionData, error: maxVersionError } = await supabase
      .from('app_configs_grape')
      .select('version')
      .eq('app_id', configToPublish.app_id)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (maxVersionError && maxVersionError.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json(
        { error: maxVersionError.message },
        { status: 500 }
      );
    }

    const nextVersion = (maxVersionData?.version || 0) + 1;

    // 4. Обновить текущую конфигурацию - сделать активной, скопировать draft_config в config и установить новую версию
    const { data, error } = await supabase
      .from('app_configs_grape')
      .update({
        config: configToPublish.draft_config, // Копируем draft_config в config
        is_active: true,
        is_draft: false,
        version: nextVersion, // Устанавливаем следующую версию
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in POST /api/app-builder/config/publish/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}