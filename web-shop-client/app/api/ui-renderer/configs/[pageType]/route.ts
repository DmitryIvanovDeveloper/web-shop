import { NextResponse } from 'next/server';
import sidebarConfig from '../../../../../src/modules/ui-renderer/infrastructure/configs/sidebar.config.json';
import mainContentConfig from '../../../../../src/modules/ui-renderer/infrastructure/configs/main-content.config.json';
import rightSidebarConfig from '../../../../../src/modules/ui-renderer/infrastructure/configs/right-sidebar.config.json';

const configs: Record<string, any> = {
  sidebar: sidebarConfig,
  'main-content': mainContentConfig,
  'right-sidebar': rightSidebarConfig,
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pageType: string }> }
) {
  try {
    const resolvedParams = await params;
    const config = configs[resolvedParams.pageType];
    
    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading config:', error);
    return NextResponse.json({ error: 'Failed to load configuration' }, { status: 500 });
  }
}

