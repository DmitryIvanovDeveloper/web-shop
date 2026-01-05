'use client';

import React from 'react';

interface LanguageResponse {
  code: string;
  name: string;
  nativeName: string;
  direction: string;
  isActive: boolean;
  fallbackCode?: string;
}

interface LanguageSelectorProps {
  activeLanguage: LanguageResponse | null;
  supportedLanguages: LanguageResponse[];
  onLanguageChange: (languageCode: string) => void;
  isLoading: boolean;
}

export function LanguageSelector({
  activeLanguage,
  supportedLanguages,
  onLanguageChange,
  isLoading
}: LanguageSelectorProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Active Language
        </label>
        <div className="relative">
          <select
            value={activeLanguage?.code || ''}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={isLoading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select language...</option>
            {supportedLanguages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.nativeName} ({language.name}) - {language.direction.toUpperCase()}
              </option>
            ))}
          </select>
          {isLoading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
        {activeLanguage && (
             <div className="mt-2 text-sm text-gray-600">
               Current text direction: <strong>{activeLanguage.direction.toUpperCase()}</strong>
               {activeLanguage.direction === 'rtl' && (
                 <span className="ml-2 text-orange-600">🔄 RTL support active</span>
               )}
             </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Supported Languages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportedLanguages.map((language) => (
            <div
              key={language.code}
              className={`border rounded-lg p-4 ${
                activeLanguage?.code === language.code
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{language.flag || '🏳️'}</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {language.nativeName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {language.name} ({language.code.toUpperCase()})
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  language.direction === 'rtl'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {language.direction.toUpperCase()}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className={`font-medium ${
                  language.isActive ? 'text-green-600' : 'text-gray-400'
                }`}>
                     {language.isActive ? 'Active' : 'Inactive'}
                </span>
                {language.fallbackCode && (
                  <span className="text-gray-500">
                    Fallback: {language.fallbackCode.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}