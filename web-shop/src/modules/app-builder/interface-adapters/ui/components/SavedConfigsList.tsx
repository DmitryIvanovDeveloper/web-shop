'use client';

import { useEffect, useState } from 'react';
import { container } from '@/infrastructure/bootstrap/container';
import { APP_BUILDER_TYPES } from '@/modules/app-builder/infrastructure/bootstrap/types';
import type { ConfigsPresenter, ConfigsViewModel } from '@/modules/app-builder/interface-adapters/presenters/configs.presenter';
import type { AppConfig } from '@/modules/app-builder/domain/entities/app-config.entity';
import type { GrapeJsProjectData } from '@/modules/app-builder/domain/entities/template.entity';

export interface SavedConfigsListProps {
  appId: string;
  merchantId: string;
  onLoadConfig?: (config: GrapeJsProjectData) => void;
  onConfigPublished?: () => void;
  canEdit?: boolean;
}

export function SavedConfigsList({ appId, merchantId, onLoadConfig, onConfigPublished, canEdit = true }: SavedConfigsListProps) {
  const [vm, setVm] = useState<ConfigsViewModel | null>(null);
  const [presenter] = useState(() =>
    container.get<ConfigsPresenter>(APP_BUILDER_TYPES.ConfigsPresenter)
  );

  useEffect(() => {
    const unsubscribe = presenter.subscribe(setVm);
    if (appId) {
      presenter.loadConfigs(appId);
    }
    return unsubscribe;
  }, [presenter, appId]);

  const deleteConfig = async (configId: string) => {
    if (!canEdit) return;

    if (!confirm('Вы уверены, что хотите удалить эту конфигурацию? Это действие нельзя отменить.')) {
      return;
    }

    const result = await presenter.deleteConfig(configId, appId);

    if (result.isFailure) {
      alert(`Ошибка удаления: ${result.error?.message}`);
      return;
    }

    alert('Конфигурация успешно удалена');
  };

  const publishConfig = async (configId: string) => {
    if (!canEdit) return;

    if (!confirm('Опубликовать эту конфигурацию? Все остальные конфигурации будут деактивированы.')) {
      return;
    }

    const result = await presenter.publishConfig(configId, appId);

    if (result.isFailure) {
      alert(`Ошибка публикации: ${result.error?.message}`);
      return;
    }

    onConfigPublished?.();
    alert('✅ Конфигурация успешно опубликована!');
  };

  if (!vm) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Initializing...</div>
      </div>
    );
  }

  if (vm.isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Загрузка конфигураций...</span>
      </div>
    );
  }

  if (vm.error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Ошибка загрузки</h3>
          <p className="text-red-600">{vm.error}</p>
          <button
            onClick={() => presenter.loadConfigs(appId)}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        💾 Сохраненные конфигурации
        {vm.isSaving && (
          <span className="ml-3 text-sm text-blue-600">Сохранение...</span>
        )}
        {vm.isDeleting && (
          <span className="ml-3 text-sm text-orange-600">Удаление...</span>
        )}
      </h3>

      {vm.configs.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">Нет сохраненных конфигураций</p>
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Версия
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Содержимое
                </th>
                {canEdit && (
                  <>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Опубликовать
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Удалить
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vm.configs.map((config) => (
                <tr
                  key={config.id}
                  className={`hover:bg-gray-50 transition ${
                    canEdit ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (canEdit && onLoadConfig) {
                      onLoadConfig(config.config);
                    }
                  }}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        v{config.version}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {config.isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Активная
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Архив
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {config.createdAt.toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {config.config.pages?.length || 0} стр, {config.config.assets?.length || 0} асс
                    </span>
                  </td>
                  {canEdit && (
                    <>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            publishConfig(config.id);
                          }}
                          disabled={vm.isSaving || vm.isDeleting}
                          className="text-sm px-3 py-1 rounded font-medium text-green-600 hover:bg-green-50 disabled:opacity-50"
                          title="Опубликовать конфигурацию"
                        >
                          🚀
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConfig(config.id);
                          }}
                          disabled={vm.isDeleting || vm.isSaving}
                          className="text-sm px-3 py-1 rounded font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Удалить конфигурацию"
                        >
                          🗑️
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}