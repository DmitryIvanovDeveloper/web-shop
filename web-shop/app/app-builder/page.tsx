'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Editor, TemplatesList, SavedConfigsList } from '@/modules/app-builder';
import { container } from '@/infrastructure/bootstrap/container';
import { APP_BUILDER_TYPES } from '@/modules/app-builder/infrastructure/bootstrap/types';
import type { ConfigsPresenter } from '@/modules/app-builder';
import type { GrapeJsProjectData } from '@/modules/app-builder';

export default function AppBuilderPage() {
  const searchParams = useSearchParams();
  const appId = searchParams?.get('appId') ?? undefined;
  const merchantId = searchParams?.get('merchantId') ?? undefined;

  // Проверка роли: редактирование запрещено если role=admin и admin=false
  const roleParam = searchParams?.get('role');
  const adminParam = searchParams?.get('admin');
  const isReadOnly = roleParam === 'admin' && adminParam === 'false';
  const canEdit = !isReadOnly;

  const editorRef = useRef<any>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const loadActiveConfig = async () => {
    if (!appId || !editorRef.current) {
      console.log('loadActiveConfig: appId or editor not ready', { appId, hasEditor: !!editorRef.current });
      return;
    }

    try {
      console.log('loadActiveConfig: Starting to load active config...');
      const useCase = container.get<import('@/modules/app-builder').GetAppConfigUseCase>(
        APP_BUILDER_TYPES.GetAppConfigUseCase
      );

      const result = await useCase.execute(appId);

      if (result.isSuccess && result.value) {
        const editor = editorRef.current;
        console.log('loadActiveConfig: Loading draft config into editor', result.value.draftConfig);
        editor.loadProjectData(result.value.draftConfig);
        console.log('Active configuration loaded successfully');
      } else {
        console.log('loadActiveConfig: No active config found or error', result);
      }
    } catch (error) {
      console.error('Failed to load active configuration:', error);
    }
  };

  // Автоматическая загрузка активной конфигурации при готовности editor и appId
  // ОТКЛЮЧЕНО: загрузка конфигурации при первой загрузке
  // useEffect(() => {
  //   if (appId && editorRef.current) {
  //     loadActiveConfig();
  //   }
  // }, [appId, editorRef.current]); // Зависит от appId и editor

  const handleSelectTemplate = async (templateData: any) => {
    if (!editorRef.current) {
      console.warn('Editor not ready yet');
      return;
    }

    setLoadingTemplate(true);
    try {
      const editor = editorRef.current;

      if (templateData.pages) {
        editor.loadProjectData(templateData);
        console.log('Template project loaded successfully');
      } else if (templateData.html || templateData.components) {
        if (templateData.html) {
          editor.setComponents(templateData.html);
        } else if (templateData.components) {
          editor.setComponents(templateData.components);
        }

        if (templateData.css) {
          editor.setStyle(templateData.css);
        } else if (templateData.styles) {
          editor.setStyle(templateData.styles);
        }
        console.log('Template loaded successfully');
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleLoadConfig = async (configData: GrapeJsProjectData) => {
    if (!editorRef.current) {
      console.warn('Editor not ready yet');
      return;
    }

    setLoadingTemplate(true);
    try {
      const editor = editorRef.current;

      if (configData.pages) {
        editor.loadProjectData(configData);
        console.log('Saved config loaded successfully');
      } else {
        // Handle old format if needed
        console.log('Config loaded successfully');
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleApply = async () => {
    if (!editorRef.current || !appId || !merchantId) {
      console.warn('Editor not ready or missing appId/merchantId');
      return;
    }

    setLoadingTemplate(true);
    try {
      const editor = editorRef.current;
      const projectData = editor.getProjectData(); // Получить текущую конфигурацию

      const presenter = container.get<ConfigsPresenter>(APP_BUILDER_TYPES.ConfigsPresenter);
      const result = await presenter.saveConfig(appId, merchantId, projectData);

      if (result.isFailure) {
        throw result.error;
      }

      console.log('Configuration applied successfully');
      alert('✅ Конфигурация сохранена!');

    } catch (error) {
      console.error('Failed to apply configuration:', error);
      alert(`❌ Ошибка сохранения конфигурации: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleSaveTemplate = async (name: string, description?: string) => {
    if (!editorRef.current) {
      throw new Error('Editor not ready');
    }

    const editor = editorRef.current;
    const templateData = editor.getProjectData();

    const response = await fetch('/api/app-builder/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        templateData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save template');
    }

    const result = await response.json();
    return result;
  };


  return (
    <div className="h-screen flex flex-col bg-white overflow-y-auto">
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">App Builder</h1>
          <p className="text-sm text-gray-600 mt-1">
            Визуальный редактор для создания шаблонов приложений
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0" style={{ flexBasis: '200px', maxHeight: '30vh' }}>
          <div className="px-6 py-4 h-full overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📚 Шаблоны
              {loadingTemplate && (
                <span className="ml-3 text-sm text-blue-600">Загрузка...</span>
              )}
              {!canEdit && (
                <span className="ml-3 text-sm text-red-600">⚠️ Только чтение</span>
              )}
            </h2>
            <TemplatesList
              onSelectTemplate={canEdit ? handleSelectTemplate : undefined}
              onApply={canEdit ? handleApply : undefined}
              onSaveTemplate={canEdit ? handleSaveTemplate : undefined}
              appId={appId}
              merchantId={merchantId}
              canEdit={canEdit}
            />
          </div>
        </div>

        <div className="border-b border-gray-200 bg-white flex-shrink-0" style={{ flexBasis: '200px', maxHeight: '30vh' }}>
          <div className="px-6 py-4 h-full overflow-y-auto">
            <SavedConfigsList
              appId={appId || ''}
              merchantId={merchantId || ''}
              onLoadConfig={canEdit ? handleLoadConfig : undefined}
              onConfigPublished={() => {
                console.log('Config published, list already refreshed');
              }}
              canEdit={canEdit}
            />
          </div>
        </div>

        <div className="flex-1 min-h-[400px] relative">
          <Editor
            onChange={canEdit ? ((data) => {
              console.log('Template data changed:', data);
            }) : undefined}
            onReady={(editor) => {
              console.log('Editor ready:', editor);
              editorRef.current = editor;
              // Небольшая задержка чтобы editor полностью инициализировался
              // ОТКЛЮЧЕНО: загрузка конфигурации при первой загрузке
              // setTimeout(() => {
              //   if (appId && editorRef.current) {
              //     loadActiveConfig();
              //   }
              // }, 500);
            }}
            readonly={!canEdit}
            className={!canEdit ? 'opacity-75' : ''}
            testMode={true}
          />

          {!canEdit && (
            <div className="absolute top-2 right-2 z-50">
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">👁️</span>
                  <span className="text-sm font-medium text-yellow-800">Режим просмотра</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">Редактирование отключено</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
