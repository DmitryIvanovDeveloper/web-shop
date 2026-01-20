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

	if (!renderSidebarButton) {
		return null;
	}

	if (!authPresenter.isConfigReady()) {
		return null;
	}

	try {
		const descriptor = authPresenter.createLoginButtonUI();

		const contextWithHandlers = {
			...descriptor.context,
			handleLoginClick: () => {
				onLoginClick();
			}
		};

		return uiRenderer.renderUI({
			...descriptor,
			context: contextWithHandlers
		});
	} catch (error) {
		return null;
	}
}

