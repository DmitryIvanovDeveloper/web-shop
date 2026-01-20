import React from 'react';
import { Language } from '../../../domain';

interface LanguageSelectorProps {
  languages: Language[];
  activeLanguageCode: string;
  onLanguageChange: (languageCode: string) => void;
  disabled?: boolean;
}


export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  activeLanguageCode,
  onLanguageChange,
  disabled = false
}) => {
  return (
    <div className="language-selector">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Active Language
      </label>
      <select
        value={activeLanguageCode}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={disabled}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {languages.map((language) => (
          <option key={language.code.value} value={language.code.value}>
            {language.flag && `${language.flag} `}
            {language.nativeName} ({language.name})
            {language.isActive && ' ✓'}
            {language.isRTL() && ' ←'}
          </option>
        ))}
      </select>

      <div className="mt-2 text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>
            Direction: {languages.find(l => l.code.value === activeLanguageCode)?.isRTL() ? 'RTL' : 'LTR'}
          </span>
          <span>
            Active: {languages.filter(l => l.isActive).length} / {languages.length}
          </span>
        </div>
      </div>
    </div>
  );
};
