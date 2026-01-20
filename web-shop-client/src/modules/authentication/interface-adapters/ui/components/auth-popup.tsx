import { useEffect, useState } from 'react';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { AUTH_TYPES } from '../../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { UIRendererPort } from '../../../../../application/ports/ui-renderer.port';
import type { AuthPresenter } from '../../presenters/auth.presenter';
import type { UIDescriptor } from '../../../../../shared/ui/ui-descriptor';

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
	const [descriptor, setDescriptor] = useState<UIDescriptor | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!showPopup || !renderPopupConfig) {
			setDescriptor(null);
			return;
		}

				const loadDescriptor = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const uiDescriptor = await authPresenter.createAuthPopupUI(
					popupState,
					appIdValue,
					userIdValue,
					errorMessage
				);
				setDescriptor(uiDescriptor);
			} catch (err) {
								setError(err instanceof Error ? err.message : 'Failed to create popup UI');
			} finally {
				setIsLoading(false);
			}
		};

		loadDescriptor();
	}, [showPopup, renderPopupConfig, popupState, appIdValue, userIdValue, errorMessage, authPresenter]);

	if (!showPopup || !renderPopupConfig) {
		return null;
	}

	if (isLoading) {
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

	if (error || !descriptor) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-gray-800 p-6 rounded-lg">
					<p className="text-red-500">{error || 'Failed to render authentication popup'}</p>
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

				return uiRenderer.renderUI({
			...descriptor,
			context: contextWithHandlers
		});
	} catch (err) {
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

