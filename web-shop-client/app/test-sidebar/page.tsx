'use client';

import { container } from '../../src/infrastructure/bootstrap/container';
import { APP_LAYOUT_TYPES } from '../../src/modules/app-layout/infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../../src/modules/app-layout/interface-adapters/presenters/sidebar-renderer.presenter';
import { SidebarRenderer } from '../../src/modules/app-layout/interface-adapters/ui/components/sidebar-renderer';
import { LOCALIZATION_TYPES } from '../../src/modules/localization';
import type { LocalizationPresenter } from '../../src/modules/localization';

export default function TestSidebarPage() {
  // Simple translation helper
  const getTranslation = () => {
    try {
      const presenter = container.get<LocalizationPresenter>(LOCALIZATION_TYPES.LocalizationPresenter);
      const vm = presenter.viewModel;
      const t = (key: string, fallback?: string): string => {
        return vm.translations[key] || fallback || key;
      };
      return { t, direction: vm.direction };
    } catch {
      const t = (key: string, fallback?: string): string => fallback || key;
      return { t, direction: 'ltr' };
    }
  };

  const { t, direction } = getTranslation();

  const sidebarPresenter = container.get<SidebarRendererPresenter>(
    APP_LAYOUT_TYPES.SidebarRendererPresenter
  );

  const sidebarConfig = sidebarPresenter.getSidebar();

  return (
    <div className="min-h-screen bg-gray-100 p-8" dir={direction}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('test.sidebar.title', 'Sidebar Localization Test')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sidebar Preview */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Sidebar Preview</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <div className="font-medium">Store Button:</div>
                <div className="text-sm text-gray-600">
                  {sidebarPresenter.getTranslation('nav.store', 'Store')}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="font-medium">Patch Notes Button:</div>
                <div className="text-sm text-gray-600">
                  {sidebarPresenter.getTranslation('nav.patchNotes', 'Patch Notes')}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="font-medium">Direction:</div>
                <div className="text-sm text-gray-600">
                  {sidebarPresenter.getDirection()}
                </div>
              </div>
            </div>
          </div>

          {/* Translation Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Translation Status</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded">
                <div className="font-medium text-blue-800">Hook Translation:</div>
                <div className="text-sm text-blue-600">
                  {t('auth.welcomeTitle', 'Welcome')}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <div className="font-medium text-green-800">Direction:</div>
                <div className="text-sm text-green-600">
                  {direction}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Testing Instructions</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Open browser console (F12) to see localization events</li>
            <li>2. Change language using the dropdown in the main app</li>
            <li>3. Refresh this page to see updated translations</li>
            <li>4. Check that sidebar button texts change accordingly</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

