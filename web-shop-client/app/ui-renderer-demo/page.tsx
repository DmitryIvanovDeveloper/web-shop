'use client';

import { container } from '../../src/infrastructure/bootstrap/container';
import { UI_RENDERER_TYPES } from '../../src/modules/ui-renderer/infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../../src/modules/ui-renderer/interface-adapters/presenters/sidebar-renderer.presenter';
import { SidebarRenderer } from '../../src/modules/ui-renderer/interface-adapters/ui/components/sidebar-renderer';

export default function UIRendererDemoPage(): JSX.Element {
  const presenter = container.get<SidebarRendererPresenter>(
    UI_RENDERER_TYPES.SidebarRendererPresenter
  );

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <SidebarRenderer presenter={presenter} />
      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-white mb-8">UI Renderer Demo</h1>
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-300">
            ← Вертикальный sidebar слева, загруженный из JSON конфигурации
          </p>
        </div>
      </main>
    </div>
  );
}

