'use client';

import { useState, useEffect } from 'react';

export default function TestLocalizationPage() {
  const [apiStatus, setApiStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAPIs = async () => {
      const results: any = {};

      try {
        // Test active language
        const activeResponse = await fetch('/api/localization/active-language');
        results.activeLanguage = {
          status: activeResponse.status,
          data: activeResponse.ok ? await activeResponse.json() : null
        };
      } catch (error) {
        results.activeLanguage = { error: (error as Error).message };
      }

      try {
        // Test languages list
        const languagesResponse = await fetch('/api/localization/languages');
        results.languages = {
          status: languagesResponse.status,
          data: languagesResponse.ok ? await languagesResponse.json() : null
        };
      } catch (error) {
        results.languages = { error: (error as Error).message };
      }

      try {
        // Test English translations
        const enResponse = await fetch('/api/localization/translations?lang=en');
        const enData = enResponse.ok ? await enResponse.json() : null;
        results.enTranslations = {
          status: enResponse.status,
          count: enData?.length || 0,
          sample: enData?.slice(0, 2) || []
        };
      } catch (error) {
        results.enTranslations = { error: (error as Error).message };
      }

      try {
        // Test Arabic translations
        const arResponse = await fetch('/api/localization/translations?lang=ar');
        const arData = arResponse.ok ? await arResponse.json() : null;
        results.arTranslations = {
          status: arResponse.status,
          count: arData?.length || 0,
          sample: arData?.slice(0, 2) || []
        };
      } catch (error) {
        results.arTranslations = { error: (error as Error).message };
      }

      setApiStatus(results);
      setLoading(false);
    };

    testAPIs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Localization Module Test</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Active Language */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Active Language</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 mb-2">Endpoint: /api/localization/active-language</p>
              <p className="text-sm mb-2">
                Status: {apiStatus.activeLanguage?.status === 200 ? '✅ OK' : '❌ Error'}
              </p>
              {apiStatus.activeLanguage?.data && (
                <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(apiStatus.activeLanguage.data, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* Languages List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Languages List</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 mb-2">Endpoint: /api/localization/languages</p>
              <p className="text-sm mb-2">
                Status: {apiStatus.languages?.status === 200 ? '✅ OK' : '❌ Error'}
              </p>
              {apiStatus.languages?.data && (
                <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(apiStatus.languages.data, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* English Translations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">English Translations</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 mb-2">Endpoint: /api/localization/translations?lang=en</p>
              <p className="text-sm mb-2">
                Status: {apiStatus.enTranslations?.status === 200 ? '✅ OK' : '❌ Error'}
              </p>
              <p className="text-sm mb-2">Count: {apiStatus.enTranslations?.count || 0}</p>
              {apiStatus.enTranslations?.sample && (
                <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(apiStatus.enTranslations.sample, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* Arabic Translations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">Arabic Translations</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 mb-2">Endpoint: /api/localization/translations?lang=ar</p>
              <p className="text-sm mb-2">
                Status: {apiStatus.arTranslations?.status === 200 ? '✅ OK' : '❌ Error'}
              </p>
              <p className="text-sm mb-2">Count: {apiStatus.arTranslations?.count || 0}</p>
              {apiStatus.arTranslations?.sample && (
                <pre className="text-xs bg-white p-2 rounded border overflow-auto" dir="rtl">
                  {JSON.stringify(apiStatus.arTranslations.sample, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-center mb-4">Test Summary</h2>
          <div className="text-center">
            {Object.values(apiStatus).every((result: any) => result.status === 200) ? (
              <div>
                <p className="text-green-600 text-xl font-semibold mb-2">✅ All API endpoints are working!</p>
                <p className="text-gray-600">
                  The client-side localization module is fully functional.
                  API routes communicate directly with Supabase without using DI container.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-600 text-xl font-semibold mb-2">❌ Some API endpoints have issues</p>
                <p className="text-gray-600">
                  Check the individual test results above for details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
