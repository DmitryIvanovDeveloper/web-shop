'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { container } from '../../../../infrastructure/bootstrap/container';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import { LocalizationPresenter } from '../presenters/localization.presenter';
import type { LocalizationViewModel } from '../view-models/localization.view-model';
import { LanguageSelector } from './components/LanguageSelector';
import { TranslationEditor } from './components/TranslationEditor';
import { LocalizationStatus } from './components/LocalizationStatus';

export default function LocalizationDashboard(): JSX.Element {
  console.log('[LocalizationDashboard] Component rendered');

  // Get Presenter from DI Container (following Clean Architecture)
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
  }, []);

  // Use View Model from Presenter (following Clean Architecture)
  const [viewModel, setViewModel] = useState<LocalizationViewModel>({
    isLoading: true,
    error: null,
    activeLanguage: null,
    supportedLanguages: [],
    translations: [],
    translationCoverage: {
      totalKeys: 0,
      translatedKeys: 0,
      coveragePercentage: 0
    },
    incompleteLanguages: []
  });

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

  // Event handlers
  const handleLanguageChange = async (languageCode: string) => {
    console.log('[LocalizationDashboard] Changing active language to:', languageCode);
    try {
      await presenter.changeActiveLanguage(languageCode);
    } catch (error) {
      console.error('[LocalizationDashboard] Error changing language:', error);
    }
  };

  const handleTranslationsUpdate = async (updates: Array<{
    key: string;
    languageCode: string;
    value: string;
  }>) => {
    console.log('[LocalizationDashboard] Updating translations:', updates.length, 'items');
    try {
      await presenter.updateTranslations(updates);
    } catch (error) {
      console.error('[LocalizationDashboard] Error updating translations:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Localization Management</h1>
        <p className="text-gray-600 mt-1">
          Manage languages, translations, and localization settings with real database data
        </p>
      </div>

      {/* Status Overview */}
      <LocalizationStatus viewModel={viewModel} />

      {/* Language Selector */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Active Language</h2>
          <p className="text-gray-600 text-sm mt-1">
            Select the currently active language for the application
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

      {/* Translation Editor */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Translation Editor</h2>
          <p className="text-gray-600 text-sm mt-1">
            Edit translations for all supported languages. Changes are saved to the database.
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

      {/* Error Display */}
      {viewModel.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{viewModel.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {viewModel.isLoading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-700">Loading localization data...</p>
          </div>
        </div>
      )}
    </div>
  );
}