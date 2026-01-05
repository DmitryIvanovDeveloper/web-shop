import React, { useEffect, useState } from 'react';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { LOCALIZATION_TYPES } from '@/infrastructure/bootstrap/types';
import type { ChangeActiveLanguageUseCase } from '../../../application/use-cases/change-active-language.use-case';
import type { UpdateTranslationsUseCase } from '../../../application/use-cases/update-translations.use-case';
import type { GetLocalizationStatusUseCase } from '../../../application/use-cases/get-localization-status.use-case';
import { Language, Translation } from '../../../domain';
import { LanguageSelector } from '../components/LanguageSelector';
import { TranslationEditor } from '../components/TranslationEditor';

/**
 * LocalizationDashboard - Main localization management page for admin
 */
export const LocalizationDashboard: React.FC = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<Language | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Get use cases from DI container
  const changeActiveLanguageUseCase = container.get<ChangeActiveLanguageUseCase>(
    LOCALIZATION_TYPES.ChangeActiveLanguageUseCase
  );

  let updateTranslationsUseCase: UpdateTranslationsUseCase | null = null;
  let getLocalizationStatusUseCase: GetLocalizationStatusUseCase | null = null;

  try {
    updateTranslationsUseCase = container.get<UpdateTranslationsUseCase>(
      LOCALIZATION_TYPES.UpdateTranslationsUseCase
    );
  } catch (error) {
    console.warn('UpdateTranslationsUseCase not available, using mock functionality');
  }

  try {
    getLocalizationStatusUseCase = container.get<GetLocalizationStatusUseCase>(
      LOCALIZATION_TYPES.GetLocalizationStatusUseCase
    );
  } catch (error) {
    console.warn('GetLocalizationStatusUseCase not available, using mock data');
  }

  // Load localization status on mount
  useEffect(() => {
    loadLocalizationStatus();
  }, []);

  const loadLocalizationStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      if (getLocalizationStatusUseCase) {
        console.log('Loading localization status from database...');

        const result = await getLocalizationStatusUseCase.execute();

        if (result.isSuccess) {
          const { languages: loadedLanguages, activeLanguage: loadedActiveLanguage } = result.data;

          console.log('Loaded languages:', loadedLanguages.length);
          console.log('Active language:', loadedActiveLanguage?.code.value);

          setLanguages(loadedLanguages);
          setActiveLanguage(loadedActiveLanguage);
        } else {
          console.error('Error loading localization status:', result.error);
          setError(result.error.message);
        }
      } else {
        // Fallback to mock data
        console.log('Using mock localization data...');

        const mockLanguages = [
          {
            id: 'en',
            code: { value: 'en' },
            name: 'English',
            nativeName: 'English',
            direction: { value: 'ltr' },
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            isRTL: () => false
          },
          {
            id: 'ar',
            code: { value: 'ar' },
            name: 'Arabic',
            nativeName: 'العربية',
            direction: { value: 'rtl' },
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            isRTL: () => true
          }
        ];

        const activeLanguage = mockLanguages.find(lang => lang.isActive);

        setLanguages(mockLanguages);
        setActiveLanguage(activeLanguage);
      }

      if (activeLanguage) {
        await loadTranslationsForLanguage(activeLanguage.code.value);
      }

    } catch (err) {
      console.error('Localization status exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const loadTranslationsForLanguage = async (languageCode: string) => {
    try {
      console.log('Loading translations for language:', languageCode);

      // Load mock translations for demo
      const mockTranslations = [
        {
          id: '1',
          key: { value: 'products.buyButton' },
          languageCode: { value: languageCode },
          value: languageCode === 'en' ? 'Buy Now' : languageCode === 'es' ? 'Comprar Ahora' : 'اشتر الآن',
          isTranslated: true,
          context: 'Button text for purchasing products',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          key: { value: 'auth.loginButton' },
          languageCode: { value: languageCode },
          value: languageCode === 'en' ? 'Login' : languageCode === 'es' ? 'Iniciar Sesión' : 'تسجيل الدخول',
          isTranslated: true,
          context: 'Button text for user login',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      console.log('Setting translations:', mockTranslations);
      setTranslations(mockTranslations);
    } catch (err) {
      console.error('Failed to load translations:', err);
      setTranslations([]);
    }
  };

  const handleLanguageChange = async (languageCode: string) => {
    try {
      setSaving(true);

      const result = await changeActiveLanguageUseCase.execute({
        languageCode
      });

      if (result.isSuccess) {
        setActiveLanguage(result.data.language);
        await loadTranslationsForLanguage(languageCode);

        // Update the active status in languages list
        setLanguages(prev => prev.map(lang =>
          lang.code.value === languageCode
            ? { ...lang, isActive: true }
            : { ...lang, isActive: false }
        ));
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTranslations = async (translationsToSave: Array<{
    key: string;
    languageCode: string;
    value: string;
    context?: string;
  }>) => {
    try {
      setSaving(true);

      if (updateTranslationsUseCase) {
        const result = await updateTranslationsUseCase.execute({
          translations: translationsToSave
        });

        if (result.isSuccess) {
          // Reload translations to reflect changes
          if (activeLanguage) {
            await loadTranslationsForLanguage(activeLanguage.code.value);
          }
        } else {
          setError(result.error.message);
        }
      } else {
        // Mock save - just show success message
        console.log('Mock saving translations:', translationsToSave);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading localization settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800 font-semibold">Error</div>
        <div className="text-red-600 mt-1">{error}</div>
        <button
          onClick={loadLocalizationStatus}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="localization-dashboard space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Localization Management
        </h1>

        {/* Language Selector */}
        <div className="mb-8">
          <LanguageSelector
            languages={languages}
            activeLanguageCode={activeLanguage?.code.value || ''}
            onLanguageChange={handleLanguageChange}
            disabled={saving}
          />
        </div>

        {/* Translation Statistics */}
        {activeLanguage && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">
              Translation Status for {activeLanguage.nativeName}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {translations.length}
                </div>
                <div className="text-sm text-gray-600">Total Keys</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {translations.filter(t => t.isTranslated).length}
                </div>
                <div className="text-sm text-gray-600">Translated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {translations.filter(t => !t.isTranslated).length}
                </div>
                <div className="text-sm text-gray-600">Missing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {translations.length > 0
                    ? Math.round((translations.filter(t => t.isTranslated).length / translations.length) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </div>
        )}

        {/* Translation Editor */}
        {activeLanguage && (
          <TranslationEditor
            language={activeLanguage}
            translations={translations}
            onSave={handleSaveTranslations}
            disabled={saving}
          />
        )}
      </div>
    </div>
  );
};
