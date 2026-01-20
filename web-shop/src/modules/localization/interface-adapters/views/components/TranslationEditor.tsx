'use client';

import React, { useState, useMemo } from 'react';

interface TranslationResponse {
  key: string;
  languageCode: string;
  value: string;
  isTranslated: boolean;
}

interface LanguageResponse {
  code: string;
  name: string;
  nativeName: string;
  direction: string;
  isActive: boolean;
  fallbackCode?: string;
}

interface TranslationEditorProps {
  translations: TranslationResponse[];
  supportedLanguages: LanguageResponse[];
  onTranslationsUpdate: (updates: Array<{
    key: string;
    languageCode: string;
    value: string;
  }>) => void;
  isLoading: boolean;
}

export function TranslationEditor({
  translations,
  supportedLanguages,
  onTranslationsUpdate,
  isLoading
}: TranslationEditorProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [changes, setChanges] = useState<Record<string, string>>({});

  const groupedTranslations = useMemo(() => {
    const groups: Record<string, Record<string, TranslationResponse>> = {};

    translations.forEach((translation) => {
      if (!groups[translation.key]) {
        groups[translation.key] = {};
      }
      groups[translation.key][translation.languageCode] = translation;
    });

    return groups;
  }, [translations]);

  const filteredTranslationKeys = useMemo(() => {
    const keys = Object.keys(groupedTranslations);

    return keys.filter((key) => {
      const matchesSearch = searchTerm === '' ||
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.values(groupedTranslations[key]).some(t =>
          t.value.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesLanguage = selectedLanguage === 'all' ||
        groupedTranslations[key][selectedLanguage];

      return matchesSearch && matchesLanguage;
    });
  }, [groupedTranslations, searchTerm, selectedLanguage]);

  const handleTranslationChange = (key: string, languageCode: string, value: string) => {
    const changeKey = `${key}:${languageCode}`;
    setChanges(prev => ({
      ...prev,
      [changeKey]: value
    }));
  };

  const handleSave = () => {
    const updates = Object.entries(changes).map(([changeKey, value]) => {
      const [key, languageCode] = changeKey.split(':');
      return { key, languageCode, value };
    });

    if (updates.length > 0) {
      onTranslationsUpdate(updates);
      setChanges({});
    }
  };

  const hasUnsavedChanges = Object.keys(changes).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by keys or translations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
               <select
                 value={selectedLanguage}
                 onChange={(e) => setSelectedLanguage(e.target.value)}
                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
               >
                 <option value="all">All Languages</option>
            {supportedLanguages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.nativeName} ({language.code.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
        {hasUnsavedChanges && (
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
                 <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Translation Key
                   </th>
              {supportedLanguages.map((language) => (
                <th key={language.code} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language.nativeName} ({language.code.toUpperCase()})
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && translations.length === 0 && (
              
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  </td>
                  {supportedLanguages.map((language) => (
                    <td key={language.code} className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
            {filteredTranslationKeys.map((key) => (
              <tr key={key} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {key}
                </td>
                {supportedLanguages.map((language) => {
                  const translation = groupedTranslations[key][language.code];
                  const changeKey = `${key}:${language.code}`;
                  const hasChange = changeKey in changes;

                  return (
                    <td key={language.code} className="px-6 py-4 whitespace-nowrap">
                      <textarea
                        value={hasChange ? changes[changeKey] : (translation?.value || '')}
                        onChange={(e) => handleTranslationChange(key, language.code, e.target.value)}
                        disabled={isLoading}
                        className={`w-full px-2 py-1 border rounded text-sm resize-none ${
                          hasChange
                            ? 'border-yellow-300 bg-yellow-50'
                            : 'border-gray-300'
                        } focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                        rows={2}
                             placeholder={`Translate to ${language.nativeName}...`}
                      />
                      {hasChange && (
                           <div className="mt-1 text-xs text-yellow-600">Modified</div>
                      )}
                      {!translation && !hasChange && (
                           <div className="mt-1 text-xs text-red-500">Not translated</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTranslationKeys.length === 0 && (
             <div className="text-center py-8 text-gray-500">
               No translations found. Try changing the search criteria.
             </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
               <div>
                 <div className="font-medium text-gray-900">Total Keys</div>
                 <div className="text-gray-600">{Object.keys(groupedTranslations).length}</div>
               </div>
               <div>
                 <div className="font-medium text-gray-900">Filtered</div>
                 <div className="text-gray-600">{filteredTranslationKeys.length}</div>
               </div>
               <div>
                 <div className="font-medium text-gray-900">Changes</div>
                 <div className="text-gray-600">{Object.keys(changes).length}</div>
               </div>
               <div>
                 <div className="font-medium text-gray-900">Languages</div>
                 <div className="text-gray-600">{supportedLanguages.length}</div>
               </div>
        </div>
      </div>
    </div>
  );
}