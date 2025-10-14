'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { container } from '../../src/infrastructure/bootstrap/container';
import { ValidateAppLoginUseCase } from '../../src/modules/authentication/application/use-cases/validate-app-login.use-case';
import { AuthPresenter } from '../../src/modules/authentication/interface-adapters/presenters/auth.presenter';
import { AuthViewModel } from '../../src/modules/authentication/interface-adapters/view-models/auth.view-model';
import { AUTH_TYPES } from '../../src/infrastructure/bootstrap/types';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewModel, setViewModel] = useState<AuthViewModel>({
    status: 'idle'
  });
  const [manualAppId, setManualAppId] = useState('');

  useEffect(() => {
    const appId = searchParams.get('appId');
    
    if (appId) {
      authenticate(appId);
    }
  }, [searchParams]);

  async function authenticate(appId: string) {
    try {
      const presenter = container.get<AuthPresenter>(AUTH_TYPES.AuthPresenter);
      setViewModel(presenter.presentLoading());

      const useCase = container.get<ValidateAppLoginUseCase>(AUTH_TYPES.ValidateAppLoginUseCase);
      const result = await useCase.execute({ appId });

      const finalViewModel = presenter.present(result);
      setViewModel(finalViewModel);

      if (finalViewModel.status === 'success' && finalViewModel.user) {
        // Сохраняем пользователя в localStorage
        localStorage.setItem('currentUser', JSON.stringify(finalViewModel.user));
        // Переходим на dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      const presenter = container.get<AuthPresenter>(AUTH_TYPES.AuthPresenter);
      setViewModel({
        status: 'error',
        error: error instanceof Error ? error.message : 'Authentication failed'
      });
    }
  }

  function handleManualAuth() {
    if (manualAppId.trim()) {
      authenticate(manualAppId.trim());
    }
  }

  // Если есть appId в query, показываем только состояния загрузки/успеха/ошибки
  if (searchParams.get('appId')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        {/* Loading State */}
        {viewModel.status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-900 dark:text-white">Validating App ID...</p>
          </div>
        )}

        {/* Success State */}
        {viewModel.status === 'success' && (
          <div className="text-center">
            <div className="text-green-400 text-6xl mb-4">✓</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Login Successful!</h3>
            <p className="text-gray-300 dark:text-gray-200">Welcome, {viewModel.user?.username}!</p>
            <p className="text-sm text-gray-400 dark:text-gray-300 mt-2">Redirecting to dashboard...</p>
          </div>
        )}

        {/* Error State */}
        {viewModel.status === 'error' && (
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">✗</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Authentication Failed</h3>
            <p className="text-gray-300 dark:text-gray-200 mb-4">{viewModel.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow-500 text-gray-900 dark:text-black px-4 py-2 rounded hover:bg-yellow-400 font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Idle State */}
        {viewModel.status === 'idle' && (
          <div className="text-center">
            <p className="text-gray-300 dark:text-gray-200">Preparing authentication...</p>
          </div>
        )}
      </div>
    );
  }

  // Если нет appId, показываем попап в стиле Pixel Gun 3D
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Pixel Gun 3D Style Popup */}
      <div className="relative bg-gray-800 border-2 border-yellow-400 rounded-lg p-8 max-w-md w-full shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white font-bold transition-colors"
        >
          ×
        </button>

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-block bg-gradient-to-br from-gray-900 to-black dark:from-black dark:to-gray-900 p-4 rounded-lg mb-4 border-2 border-yellow-400">
            <div className="text-yellow-400 font-bold text-4xl" style={{ fontFamily: 'monospace' }}>
              <div>PG3D</div>
              <div className="text-2xl">HUB</div>
            </div>
          </div>
          <p className="text-gray-900 dark:text-white text-sm mb-2">Добро пожаловать в</p>
          <h1 className="text-gray-900 dark:text-white text-xl font-bold">Pixel Gun 3D: Online Shooter Hub</h1>
        </div>

        {/* Instruction */}
        <p className="text-gray-900 dark:text-white text-center mb-6">
          Введите ваш App ID, чтобы продолжить
        </p>

        {/* Input Field */}
        <div className="mb-6">
          <input
            type="text"
            value={manualAppId}
            onChange={(e) => setManualAppId(e.target.value)}
            placeholder="App ID"
            className="w-full px-4 py-3 bg-gray-700 dark:bg-gray-600 border-2 border-yellow-400 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-yellow-300 text-center font-mono"
            onKeyPress={(e) => e.key === 'Enter' && handleManualAuth()}
            autoFocus
          />
        </div>

        {/* Legal Agreement */}
        <div className="mb-6">
          <label className="flex items-start gap-3 text-gray-900 dark:text-white text-sm cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 bg-gray-700 dark:bg-gray-600 border-2 border-gray-500 rounded focus:ring-yellow-400 focus:ring-2"
              defaultChecked
            />
            <span>
              Мне 13 лет или старше и я соглашаюсь с{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">Политикой конфиденциальности,</a>{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">Условиями использования</a>{' '}
              и{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">Политикой возвратов</a>
            </span>
          </label>
        </div>

        {/* Login Button */}
        <button
          onClick={handleManualAuth}
          disabled={!manualAppId.trim()}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-700 text-gray-900 dark:text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
        >
          Войти
        </button>

        {/* Help Section */}
        <div className="mt-6 bg-gray-700 dark:bg-gray-600 border border-gray-600 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white text-sm">
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
              ?
            </div>
            <span>Где я могу найти App ID?</span>
            <button className="ml-auto text-gray-400 hover:text-gray-900 dark:hover:text-white">
              ▼
            </button>
          </div>
          <div className="mt-2 text-gray-300 dark:text-gray-200 text-xs">
            App ID предоставляется приложением Pixel Gun 3D при переходе в магазин. 
            Попробуйте: <span className="font-mono text-yellow-400">game-123</span> или <span className="font-mono text-yellow-400">app-456</span>
          </div>
        </div>
      </div>
    </div>
  );
}
