'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { container } from '../../../../infrastructure/bootstrap/container';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import { LocalizationPresenter } from '../presenters/localization.presenter';
import type { LocalizationViewModel } from '../view-models/localization.view-model';
import { LanguageSelector } from './components/LanguageSelector';
import { TranslationEditor } from './components/TranslationEditor';
import { LocalizationStatus } from './components/LocalizationStatus';

interface ClientLocalizationDashboardProps {
  initialViewModel: LocalizationViewModel;
}

export default function ClientLocalizationDashboard({ initialViewModel }: ClientLocalizationDashboardProps): JSX.Element {
  console.log('[LocalizationDashboard] Component rendered');

  // Get Presenter from DI Container (following pattern from other modules)
  const presenter = useMemo(() => {
    console.log('[LocalizationDashboard] Getting presenter from container');
    try {
      const presenter = container.get<LocalizationPresenter>(LOCALIZATION_TYPES.LocalizationPresenter);
      console.log('[LocalizationDashboard] Presenter obtained successfully');
      return presenter;
    } catch (error) {
      console.error('[LocalizationDashboard] Failed to get presenter:', error);
      throw error;
    }
  }, []); // Presenter is stable, no need for dependencies

  // Use View Model from Presenter (following pattern from other modules)
  const [viewModel, setViewModel] = useState<LocalizationViewModel>(initialViewModel);

  useEffect(() => {
    console.log('[LocalizationDashboard] useEffect triggered, presenter:', presenter);

    // Subscribe to View Model changes
    const unsubscribe = presenter.subscribe(() => {
      console.log('[LocalizationDashboard] View model updated:', presenter.viewModel);
      setViewModel(presenter.viewModel);
    });

    // Load initial data through Presenter (Clean Architecture)
    console.log('[LocalizationDashboard] Calling loadLocalizationStatus');
    presenter.loadLocalizationStatus();

    return unsubscribe;
  }, [presenter]);

  const handleLanguageChange = async (languageCode: string): Promise<void> => {
    console.log('[LocalizationDashboard] Language change requested:', languageCode);
    await presenter.changeActiveLanguage(languageCode);
  };

  const handleTranslationsUpdate = async (updates: Array<{
    key: string;
    languageCode: string;
    value: string;
  }>): Promise<void> => {
    console.log('[LocalizationDashboard] Translation updates:', updates);
    await presenter.updateTranslations(updates);
  };

  const handleErrorClear = (): void => {
    console.log('[LocalizationDashboard] Clearing error');
    presenter.clearError();
  };

  const isRTL = viewModel.activeLanguage?.direction === 'rtl';

  useEffect(() => {
    if (isRTL) {
      document.documentElement.classList.add('rtl');
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.classList.remove('rtl');
      document.documentElement.dir = 'ltr';
    }

    return () => {
      document.documentElement.classList.remove('rtl');
      document.documentElement.dir = 'ltr';
    };
  }, [isRTL]);

  console.log('[LocalizationDashboard] Rendering with viewModel:', viewModel);

  if (viewModel.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading localization data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {viewModel.error}
              </div>
            </div>
          </div>
          <button
            onClick={handleErrorClear}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Localization Management</h1>
        <p className="text-gray-600 mt-1">
          Manage languages and translations for your application
        </p>
      </div>

      {/* Status Overview */}
      <LocalizationStatus viewModel={viewModel} />

      {/* Language Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Language Settings</h2>
          <p className="text-gray-600 text-sm mt-1">
            Configure supported languages and active language
          </p>
        </div>
        <div className="p-6">
          <LanguageSelector
            activeLanguage={viewModel.activeLanguage}
            supportedLanguages={viewModel.supportedLanguages}
            onLanguageChange={handleLanguageChange}
            isLoading={viewModel.isLoading}
          />
        </div>
      </div>

      {/* Translation Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Translation Editor</h2>
          <p className="text-gray-600 text-sm mt-1">
            Edit translations for different languages
          </p>
        </div>
        <div className="p-6">
          <TranslationEditor
            translations={viewModel.translations}
            supportedLanguages={viewModel.supportedLanguages}
            onTranslationsUpdate={handleTranslationsUpdate}
            isLoading={viewModel.isLoading}
          />
        </div>
      </div>

    </div>
  );
}