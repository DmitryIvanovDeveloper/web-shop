'use client';

import { useState } from 'react';
import { container } from '../../../../infrastructure/bootstrap/container';
import { ValidateAppLoginUseCase } from '../../application/use-cases/validate-app-login.use-case';
import { AuthPresenter } from '../presenters/auth.presenter';
import { AuthViewModel } from '../view-models/auth.view-model';
import type { AppUser } from '../../domain/types';
import { AUTH_TYPES } from '../../infrastructure/bootstrap/types';

interface AuthPopupProps {
  onClose: () => void;
  /** Кастомные CSS классы для popup */
  className?: string;
  /** Callback при успешной авторизации */
  onAuthSuccess?: (user: AppUser) => void;
  /** Callback при ошибке авторизации */
  onAuthError?: (error: string) => void;
  /** Задержка перед закрытием popup при успехе (по умолчанию 1500ms) */
  closeDelay?: number;
}

export function AuthPopup({ 
  onClose, 
  className,
  onAuthSuccess,
  onAuthError,
  closeDelay = 1500
}: AuthPopupProps) {
  const [viewModel, setViewModel] = useState<AuthViewModel>({ status: 'idle' });
  const [manualAppId, setManualAppId] = useState('');

  const useCase = container.get<ValidateAppLoginUseCase>(AUTH_TYPES.ValidateAppLoginUseCase);
  const presenter = container.get<AuthPresenter>(AUTH_TYPES.AuthPresenter);

  async function authenticate(appId: string) {
    setViewModel(presenter.presentLoading());

    try {
      const result = await useCase.execute({ appId });
      
      if (result.isSuccess()) {
        const viewModel = presenter.present(result.data);
        setViewModel(viewModel);
        
        // Use Case уже сохранил в localStorage и опубликовал событие в EventBus
        // Обработчики автоматически выполнятся (скрыть Login, загрузить Offers)
        
        // Вызываем callback успешной авторизации
        onAuthSuccess?.(result.data);
        
        // Закрываем popup через задержку для UX
        setTimeout(() => {
          onClose();
          // НЕ делаем редирект - пользователь остаётся на текущей странице
        }, closeDelay);
      } else {
        // При ошибке
        setViewModel({
          status: 'error',
          error: result.error?.message || 'Authentication failed'
        });
        onAuthError?.(result.error?.message || 'Authentication failed');
      }
    } catch (error) {
      const errorMessage = 'Произошла ошибка при авторизации';
      setViewModel({
        status: 'error',
        error: errorMessage
      });
      onAuthError?.(errorMessage);
    }
  }

  function handleManualAuth() {
    if (manualAppId.trim()) {
      authenticate(manualAppId.trim());
    }
  }

  const defaultClassName = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
  const popupClassName = "relative bg-gray-800 border-2 border-yellow-400 rounded-lg p-3 w-80 shadow-2xl";
  const finalClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

  return (
    <div className={finalClassName}>
      {/* Pixel Gun 3D Style Popup */}
      <div className={popupClassName}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors"
        >
          ×
        </button>

        {/* Logo */}
        <div className="text-center mb-3">
          <div className="inline-block bg-gradient-to-br from-gray-900 to-black dark:from-black dark:to-gray-900 p-1.5 rounded mb-1.5 border-2 border-yellow-400">
            <div className="text-yellow-400 font-bold text-lg" style={{ fontFamily: 'monospace' }}>
              <div>PG3D</div>
              <div className="text-xs">HUB</div>
            </div>
          </div>
          <p className="text-gray-900 dark:text-white text-xs mb-0.5">Добро пожаловать в</p>
          <h1 className="text-gray-900 dark:text-white text-xs font-bold">Web Shop 3D: Online Shooter Hub</h1>
        </div>

        {/* Loading State */}
        {viewModel.status === 'loading' && (
          <div className="text-center mb-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-1.5 text-gray-900 dark:text-white text-xs">Validating App ID...</p>
          </div>
        )}

        {/* Success State */}
        {viewModel.status === 'success' && (
          <div className="text-center mb-3">
            <div className="text-green-400 text-3xl mb-1.5">✓</div>
            <h3 className="text-xs font-medium text-gray-900 dark:text-white mb-1">Login Successful!</h3>
            <p className="text-gray-300 dark:text-gray-200 text-xs">Welcome, {viewModel.user?.username}!</p>
            <p className="text-xs text-gray-400 dark:text-gray-300 mt-0.5">Redirecting to dashboard...</p>
          </div>
        )}

        {/* Error State */}
        {viewModel.status === 'error' && (
          <div className="text-center mb-3">
            <div className="text-red-400 text-3xl mb-1.5">✗</div>
            <h3 className="text-xs font-medium text-gray-900 dark:text-white mb-1">Authentication Failed</h3>
            <p className="text-gray-300 dark:text-gray-200 text-xs mb-1.5">{viewModel.error}</p>
          </div>
        )}

        {/* Input Form (only show when not loading or success) */}
        {viewModel.status !== 'loading' && viewModel.status !== 'success' && (
          <>
            {/* Instruction */}
            <p className="text-gray-900 dark:text-white text-center text-xs mb-2">
              Введите ваш App ID, чтобы продолжить
            </p>

            {/* Input Field */}
            <div className="mb-2">
              <input
                type="text"
                value={manualAppId}
                onChange={(e) => setManualAppId(e.target.value)}
                placeholder="App ID"
                className="w-full px-2 py-1.5 bg-gray-700 dark:bg-gray-600 border-2 border-yellow-400 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-yellow-300 text-center font-mono text-xs"
                onKeyPress={(e) => e.key === 'Enter' && handleManualAuth()}
                autoFocus
              />
            </div>

            {/* Legal Agreement */}
            <div className="mb-2">
              <label className="flex items-start gap-1.5 text-gray-900 dark:text-white text-xs cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 w-3 h-3 bg-gray-700 dark:bg-gray-600 border-2 border-gray-500 rounded focus:ring-yellow-400 focus:ring-2"
                  defaultChecked
                />
                <span className="leading-tight">
                  Мне 13 лет или старше и я соглашаюсь с{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300">Политикой конфиденциальности,</a>{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300">Условиями использования</a>{' '}
                  и{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300">Политикой возвратов</a>
                </span>
              </label>
            </div>


            {/* Help Section */}
            <div className="mt-2 bg-gray-700 dark:bg-gray-600 border border-gray-600 rounded-lg p-1.5">
              <div className="flex items-center gap-1.5 text-gray-900 dark:text-white text-xs">
                <div className="w-3 h-3 bg-gray-600 rounded-full flex items-center justify-center text-xs">
                  ?
                </div>
                <span>Где я могу найти App ID?</span>
                <button className="ml-auto text-gray-400 hover:text-gray-900 dark:hover:text-white text-xs">
                  ▼
                </button>
              </div>
              <div className="mt-1 text-gray-300 dark:text-gray-200 text-xs leading-tight">
                App ID предоставляется приложением Pixel Gun 3D при переходе в магазин.
                Попробуйте: <span className="font-mono text-yellow-400">game-123</span> или <span className="font-mono text-yellow-400">app-456</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
