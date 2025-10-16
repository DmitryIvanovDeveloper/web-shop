import { NextResponse } from 'next/server';
import sidebarConfig from '../../../../../src/modules/ui-renderer/infrastructure/configs/sidebar.config.json';
import mainContentConfig from '../../../../../src/modules/ui-renderer/infrastructure/configs/main-content.config.json';

const configs: Record<string, any> = {
  sidebar: sidebarConfig,
  'main-content': mainContentConfig,
};

export async function GET(
  request: Request,
  { params }: { params: { pageType: string } }
) {
  try {
    const config = configs[params.pageType];
    
    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading config:', error);
    return NextResponse.json({ error: 'Failed to load configuration' }, { status: 500 });
  }
}

