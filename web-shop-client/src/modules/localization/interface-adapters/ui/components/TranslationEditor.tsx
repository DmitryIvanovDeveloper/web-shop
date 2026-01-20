import React, { useState } from 'react';
import { Language, Translation } from '../../../domain';

interface TranslationEditorProps {
  language: Language;
  translations: Translation[];
  onSave: (translations: Array<{
    key: string;
    languageCode: string;
    value: string;
    context?: string;
  }>) => void;
  disabled?: boolean;
}


export const TranslationEditor: React.FC<TranslationEditorProps> = ({
  language,
  translations,
  onSave,
  disabled = false
}) => {
  const [editedTranslations, setEditedTranslations] = useState<
    Record<string, { value: string; context: string }>
  >({});

  const handleTranslationChange = (key: string, field: 'value' | 'context', newValue: string) => {
    setEditedTranslations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: newValue
      }
    }));
  };

  const handleSave = () => {
    const translationsToSave = translations
      .filter(translation => {
        const edited = editedTranslations[translation.key.value];
        return edited && (edited.value !== translation.value || edited.context !== (translation.context || ''));
      })
      .map(translation => {
        const edited = editedTranslations[translation.key.value];
        return {
          key: translation.key.value,
          languageCode: language.code.value,
          value: edited?.value ?? translation.value,
          context: edited?.context ?? translation.context
        };
      });

    if (translationsToSave.length > 0) {
      onSave(translationsToSave);
      setEditedTranslations({});
    }
  };

  const getTranslationValue = (translation: Translation) => {
    return editedTranslations[translation.key.value]?.value ?? translation.value;
  };

  const getTranslationContext = (translation: Translation) => {
    return editedTranslations[translation.key.value]?.context ?? (translation.context || '');
  };

  const hasUnsavedChanges = Object.keys(editedTranslations).length > 0;

  return (
    <div className="translation-editor">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Translations for {language.nativeName} ({language.name})
          {language.flag && ` ${language.flag}`}
        </h3>
        <button
          onClick={handleSave}
          disabled={disabled || !hasUnsavedChanges}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Save Changes ({Object.keys(editedTranslations).length})
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {translations.map((translation) => (
          <div key={translation.key.value} className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-start mb-2">
              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {translation.key.value}
              </code>
              <div className="flex items-center space-x-2">
                {translation.isTranslated ? (
                  <span className="text-green-600 text-sm">✓ Translated</span>
                ) : (
                  <span className="text-orange-600 text-sm">⚠ Missing</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Translation
                </label>
                <textarea
                  value={getTranslationValue(translation)}
                  onChange={(e) => handleTranslationChange(translation.key.value, 'value', e.target.value)}
                  disabled={disabled}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder={`Enter translation for ${translation.key.value}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Context (optional)
                </label>
                <input
                  type="text"
                  value={getTranslationContext(translation)}
                  onChange={(e) => handleTranslationChange(translation.key.value, 'context', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Help text for translators"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {translations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No translations available for this language.
        </div>
      )}
    </div>
  );
};
