/**
 * Action Handler Service - Unit Tests
 * Тесты обработки actions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIActionHandler } from '../action-handler.service';
import type { ActionConfig } from '../../../../shared/ui/actions-config';
import type { ActionContext } from '../../../../shared/ui/action-context';

describe('UIActionHandler', () => {
	let actionHandler: UIActionHandler;

	beforeEach(() => {
		actionHandler = new UIActionHandler();
	});

	describe('handleAction', () => {
		it('should handle navigate action', () => {
			const mockLocation = {
				href: ''
			};
			Object.defineProperty(window, 'location', {
				value: mockLocation,
				writable: true
			});

			const action: ActionConfig = {
				type: 'navigate',
				url: '/products'
			};

			actionHandler.handleAction(action, {});

			expect(mockLocation.href).toBe('/products');
		});

		it('should handle custom action with handler function', () => {
			const mockHandler = vi.fn();
			const context: ActionContext = {
				handleCustomAction: mockHandler
			};

			const action: ActionConfig = {
				type: 'custom',
				handler: 'handleCustomAction',
				params: { productId: '123' }
			};

			actionHandler.handleAction(action, context);

			expect(mockHandler).toHaveBeenCalledWith({ productId: '123' });
		});

		it('should handle custom action with value parameter', () => {
			const mockHandler = vi.fn();
			const context: ActionContext = {
				handleValueChange: mockHandler
			};

			const action: ActionConfig = {
				type: 'custom',
				handler: 'handleValueChange'
			};

			actionHandler.handleAction(action, context, 'new-value');

			expect(mockHandler).toHaveBeenCalledWith('new-value');
		});

		it('should handle event action', () => {
			const mockDispatchEvent = vi.fn();
			Object.defineProperty(window, 'dispatchEvent', {
				value: mockDispatchEvent,
				writable: true
			});

			const action: ActionConfig = {
				type: 'event',
				eventName: 'productSelected',
				payload: { productId: '123' }
			};

			actionHandler.handleAction(action, {});

			expect(mockDispatchEvent).toHaveBeenCalled();
		});

		it('should log error when custom handler not found', () => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
			const context: ActionContext = {};

			const action: ActionConfig = {
				type: 'custom',
				handler: 'nonExistentHandler'
			};

			actionHandler.handleAction(action, context);

			expect(consoleError).toHaveBeenCalledWith(
				'[UIActionHandler] Handler not found in context:',
				'nonExistentHandler'
			);

			consoleError.mockRestore();
		});
	});
});


