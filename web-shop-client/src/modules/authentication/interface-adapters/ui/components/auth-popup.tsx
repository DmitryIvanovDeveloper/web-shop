import { container } from '../../../../../infrastructure/bootstrap/container';
import { AUTH_TYPES } from '../../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { UIRendererPort } from '../../../../../application/ports/ui-renderer.port';
import type { AuthPresenter } from '../../presenters/auth.presenter';

type PopupState = 'idle' | 'loading' | 'success' | 'error';

interface AuthPopupProps {
	showPopup: boolean;
	renderPopupConfig: boolean;
	popupState: PopupState;
	appIdValue: string;
	userIdValue: string;
	errorMessage: string | null;
	onAppIdChange: (value: string) => void;
	onUserIdChange: (value: string) => void;
	onAuthSubmit: () => void;
	onPopupClose: () => void;
}

export function AuthPopup({
	showPopup,
	renderPopupConfig,
	popupState,
	appIdValue,
	userIdValue,
	errorMessage,
	onAppIdChange,
	onUserIdChange,
	onAuthSubmit,
	onPopupClose
}: AuthPopupProps) {
	const authPresenter = container.get<AuthPresenter>(AUTH_TYPES.AuthPresenter);
	const uiRenderer = container.get<UIRendererPort>(ROOT_TYPES.UIRenderer);

	if (!showPopup || !renderPopupConfig) {
		return null;
	}

	// Проверяем, что конфиг загружен перед рендерингом
	if (!authPresenter.isConfigReady()) {
		console.warn('[AuthPopup] Config not ready, cannot render popup');
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-gray-800 p-6 rounded-lg">
					<p className="text-yellow-500">Loading authentication configuration...</p>
					<button 
						onClick={onPopupClose}
						className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
					>
						Close
					</button>
				</div>
			</div>
		);
	}

	try {
		// Создаём UIDescriptor из Presenter
		const descriptor = authPresenter.createAuthPopupUI(
			popupState,
			appIdValue,
			userIdValue,
			errorMessage
		);

		// Добавляем реальные handlers в context
		const contextWithHandlers = {
			...descriptor.context,
			handleAppIdChange: (value: string) => {
				onAppIdChange(value);
			},
			handleUserIdChange: (value: string) => {
				onUserIdChange(value);
			},
			handleAuthSubmit: () => {
				onAuthSubmit();
			},
			onPopupClose: () => {
				onPopupClose();
			}
		};

		// Рендерим через UI Renderer Service
		return uiRenderer.renderUI({
			...descriptor,
			context: contextWithHandlers
		});
	} catch (error) {
		console.error('[AuthPopup] Error rendering popup:', error);
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-gray-800 p-6 rounded-lg">
					<p className="text-red-500">Failed to render authentication popup</p>
					<button 
						onClick={onPopupClose}
						className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
					>
						Close
					</button>
				</div>
			</div>
		);
	}
}

