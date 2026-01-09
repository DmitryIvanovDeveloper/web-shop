'use client';

import React from 'react';
import { useTranslation } from '../hooks/use-localization';

export function LocalizationExample(): JSX.Element {
  const { t, currentLanguage, direction, isLoading } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6" dir={direction}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('auth.welcomeTitle', 'Welcome')}
        </h1>
        <p className="text-gray-600">
          {t('auth.welcomeMessage', 'Welcome to')} {t('auth.welcomeSubtitle', 'WebShop Game Hub')}
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
        <p className="text-sm text-gray-500">
          Current language: {currentLanguage?.name || 'Unknown'} ({currentLanguage?.code || 'N/A'})
        </p>
        <p className="text-sm text-gray-500">
          Text direction: {direction.toUpperCase()}
        </p>
      </div>
    </div>
  );
}

