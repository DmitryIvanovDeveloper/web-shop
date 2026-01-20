import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: configs, error: findError } = await supabase
      .from('app_configs')
      .select('id, config')
      .eq('app_id', 'APP123')
      .eq('is_active', true)
      .eq('is_draft', false);

    if (findError) {
      return NextResponse.json({ error: 'Failed to find config', details: findError }, { status: 500 });
    }

    if (!configs || configs.length === 0) {
      return NextResponse.json({ error: 'No active config found for APP123' }, { status: 404 });
    }

    const configId = configs[0].id;
    const currentConfig = configs[0].config;

    const updatedChildren = [
      
      ...(currentConfig.modules?.uiRenderer?.sidebar?.layout?.children || []).map((child: any) => {
        if (child.id === 'button-68b97f4c-358c-461f-a428-4b1eebcedc41') {
          return { ...child, id: 'store-button' };
        }
        if (child.id === 'button-95ac11a9-a9de-4b9b-8a78-d9cb143aa3e0') {
          return { ...child, id: 'home-button' };
        }
        if (child.id === 'button-b7e96a7d-2547-4220-b667-c5bdac19e3f8') {
          return { ...child, id: 'new-button' };
        }
        return child;
      }),
      
      {
        id: 'patch-notes-button',
        type: 'Button',
        props: {
          icon: '📋',
          text: 'Patch Notes',
          fullWidth: true
        },
        styles: {
          padding: '13.2px',
          textAlign: 'left',
          textColor: '#FFFFFF',
          borderRadius: '5.6rem',
          justifyContent: 'flex-start',
          backgroundColor: '#a43232'
        },
        actions: {
          onClick: {
            type: 'custom',
            handler: 'navigateToPatchNotes'
          }
        }
      }
    ];

    const updatedConfig = {
      ...currentConfig,
      modules: {
        ...currentConfig.modules,
        uiRenderer: {
          ...currentConfig.modules?.uiRenderer,
          sidebar: {
            ...currentConfig.modules?.uiRenderer?.sidebar,
            layout: {
              ...currentConfig.modules?.uiRenderer?.sidebar?.layout,
              children: updatedChildren
            }
          }
        }
      }
    };

    const { error: updateError } = await supabase
      .from('app_configs')
      .update({ config: updatedConfig })
      .eq('id', configId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update config', details: updateError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Sidebar config updated successfully',
      configId,
      buttonsCount: updatedChildren.length
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}

