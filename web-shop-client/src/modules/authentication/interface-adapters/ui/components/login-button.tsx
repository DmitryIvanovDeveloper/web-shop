import { container } from '../../../../../infrastructure/bootstrap/container';
import { AUTH_TYPES } from '../../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { UIRendererPort } from '../../../../../application/ports/ui-renderer.port';
import type { AuthPresenter } from '../../presenters/auth.presenter';

interface LoginButtonProps {
	renderSidebarButton: boolean;
	onLoginClick: () => void;
}

export function LoginButton({ 
	renderSidebarButton,
	onLoginClick 
}: LoginButtonProps) {
	const authPresenter = container.get<AuthPresenter>(AUTH_TYPES.AuthPresenter);
	const uiRenderer = container.get<UIRendererPort>(ROOT_TYPES.UIRenderer);

	console.log('[LoginButton] renderLoginButton called:', {
		renderSidebarButton,
		isConfigReady: authPresenter.isConfigReady()
	});

	// Показываем кнопку только если renderSidebarButton === true
	if (!renderSidebarButton) {
		console.log('[LoginButton] renderLoginButton returning null:', {
			renderSidebarButtonDisabled: !renderSidebarButton
		});
		return null;
	}

	// Проверяем готовность конфига перед рендером
	// Если конфиг не готов, все равно показываем кнопку (она будет использовать дефолтные значения)
	if (!authPresenter.isConfigReady()) {
		console.log('[LoginButton] Config not ready yet, but showing login button anyway');
		// Не возвращаем null - продолжаем рендеринг с дефолтными значениями
	}

	try {
		// Создаём UIDescriptor из Presenter
		const descriptor = authPresenter.createLoginButtonUI();

		// Добавляем реальный handler в context
		const contextWithHandlers = {
			...descriptor.context,
			handleLoginClick: () => {
				onLoginClick();
			}
		};

		// Рендерим через UI Renderer Service
		return uiRenderer.renderUI({
			...descriptor,
			context: contextWithHandlers
		});
	} catch (error) {
		console.error('[LoginButton] Error rendering login button:', error);
		// Не рендерим кнопку при ошибке
		return null;
	}
}

