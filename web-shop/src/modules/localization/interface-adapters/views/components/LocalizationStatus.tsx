'use client';

import React from 'react';
import type { LocalizationViewModel } from '../../view-models/localization.view-model';

interface LocalizationStatusProps {
  viewModel: LocalizationViewModel;
}

export function LocalizationStatus({ viewModel }: LocalizationStatusProps): JSX.Element {
  const { translationCoverage, incompleteLanguages, supportedLanguages, activeLanguage } = viewModel;

  const coveragePercentage = translationCoverage.coveragePercentage;
  const isComplete = coveragePercentage === 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isComplete ? 'bg-green-100' : coveragePercentage > 50 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  isComplete ? 'text-green-600' : coveragePercentage > 50 ? 'text-yellow-600' : 'text-red-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Localization Status
                </dt>
                <dd className="flex items-center">
                  <div className="text-lg font-medium text-gray-900">
                    {coveragePercentage}%
                  </div>
                  <div className={`ml-2 text-sm ${
                    isComplete ? 'text-green-600' :
                    coveragePercentage > 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {isComplete ? 'Fully Translated' :
                     coveragePercentage > 50 ? 'Good Progress' : 'Needs Attention'}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Translation Progress
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {translationCoverage.translatedKeys} / {translationCoverage.totalKeys}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        isComplete ? 'bg-green-600' :
                        coveragePercentage > 50 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${coveragePercentage}%` }}
                    />
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Incomplete Languages
                </dt>
                <dd className="flex items-center">
                  <div className="text-lg font-medium text-gray-900">
                    {incompleteLanguages.length}
                  </div>
                  {incompleteLanguages.length > 0 && (
                    <div className="ml-2 text-sm text-red-600">
                      Need Attention
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {}
      {incompleteLanguages.length > 0 && (
        <div className="md:col-span-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Languages requiring additional translations:
            </h4>
            <div className="flex flex-wrap gap-2">
              {incompleteLanguages.map((lang) => (
                <span
                  key={lang.languageCode}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                >
                  {lang.languageName} ({lang.languageCode.toUpperCase()})
                  <span className="ml-1 text-yellow-600">
                    -{lang.missingTranslations} keys
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {}
      <div className="md:col-span-3">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Supported Languages ({supportedLanguages.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {supportedLanguages.map((language) => (
              <div
                key={language.code}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  language.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className="mr-2">🏳️</span>
                {language.nativeName} ({language.code.toUpperCase()})
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                  language.direction === 'rtl'
                    ? 'bg-orange-200 text-orange-800'
                    : 'bg-blue-200 text-blue-800'
                }`}>
                  {language.direction.toUpperCase()}
                </span>
                {!language.isActive && (
                  <span className="ml-2 text-gray-500">(inactive)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}