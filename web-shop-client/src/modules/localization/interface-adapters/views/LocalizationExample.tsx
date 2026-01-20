'use client';

import React, { useEffect, useState } from 'react';
import { container } from '../../../../infrastructure/bootstrap/container';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import type { LocalizationPresenter } from '../presenters/localization.presenter';
import type { LocalizationViewModel } from '../view-models/localization.view-model';

export function LocalizationExample(): JSX.Element {
  const [viewModel, setViewModel] = useState<LocalizationViewModel>({
    isLoading: true,
    error: null,
    currentLanguage: null,
    translations: {},
    direction: 'ltr'
  });

  const [presenter, setPresenter] = useState<LocalizationPresenter | null>(null);

  useEffect(() => {
        const localizationPresenter = container.get<LocalizationPresenter>(
      LOCALIZATION_TYPES.LocalizationPresenter
    );
    setPresenter(localizationPresenter);

        const unsubscribe = localizationPresenter.subscribe(setViewModel);

        localizationPresenter.loadLocalization();

    return unsubscribe;
  }, []);

  const t = (key: string, fallback?: string): string => {
    return viewModel.translations[key] || fallback || key;
  };

  if (viewModel.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6" dir={viewModel.direction}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('auth.welcomeTitle', 'Welcome')}
        </h1>
        <p className="text-gray-600">
          {t('auth.welcomeMessage', '')} {t('auth.welcomeSubtitle', '')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.enterAppId', 'Enter your App ID')}
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('auth.appIdPlaceholder', 'Enter App ID')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.enterUserId', 'Enter your User ID')}
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('auth.userIdPlaceholder', 'Enter User ID')}
          />
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
          {t('auth.submitButton', 'Submit')}
        </button>
      </div>

      <div className="mt-6 text-center">
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Change Language:</p>
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => presenter?.changeLocalization('en')}
              disabled={viewModel.isLoading || viewModel.currentLanguage?.code === 'en'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              English
            </button>
            <button
              onClick={() => presenter?.changeLocalization('ar')}
              disabled={viewModel.isLoading || viewModel.currentLanguage?.code === 'ar'}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              العربية
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Current language: {viewModel.currentLanguage?.name || 'Unknown'} ({viewModel.currentLanguage?.code || 'N/A'})
        </p>
        <p className="text-sm text-gray-500">
          Text direction: {viewModel.direction.toUpperCase()}
        </p>

        {viewModel.error && (
          <p className="text-sm text-red-500 mt-2">
            Error: {viewModel.error}
          </p>
        )}
      </div>
    </div>
  );
}

