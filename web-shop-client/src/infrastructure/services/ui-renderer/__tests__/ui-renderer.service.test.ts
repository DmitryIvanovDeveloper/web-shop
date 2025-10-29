/**
 * UI Renderer Service - Unit Tests
 * Тесты универсального сервиса рендеринга
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Container } from 'inversify';
import { UIRendererService } from '../ui-renderer.service';
import { UIComponentRegistry } from '../component-registry.service';
import { UIStyleBuilder } from '../style-builder.service';
import { UIActionHandler } from '../action-handler.service';
import { ROOT_TYPES } from '../../../bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { UIDescriptor } from '../../../../shared/ui/ui-descriptor';
import type { ComponentNode } from '../../../../shared/ui/component-node';
import type { ThemeConfig } from '../../../../shared/ui/theme-config';

describe('UIRendererService', () => {
	let container: Container;
	let service: UIRendererService;
	let mockLogger: Logger;

	beforeEach(() => {
		container = new Container();

		mockLogger = {
			info: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			debug: vi.fn()
		} as unknown as Logger;

		container.bind<Logger>(ROOT_TYPES.Logger).toConstantValue(mockLogger);
		container.bind(UIComponentRegistry).toSelf().inSingletonScope();
		container.bind(UIStyleBuilder).toSelf().inSingletonScope();
		container.bind(UIActionHandler).toSelf().inSingletonScope();

		const registry = container.get(UIComponentRegistry);
		const styleBuilder = container.get(UIStyleBuilder);
		const actionHandler = container.get(UIActionHandler);

		service = new UIRendererService(mockLogger, registry, styleBuilder, actionHandler);
	});

	describe('renderUI', () => {
		it('should render simple UI descriptor', () => {
			const descriptor: UIDescriptor = {
				layout: {
					id: 'test-container',
					type: 'Container',
					props: { vertical: true },
					styles: { padding: 4 }
				},
				theme: {
					colors: {
						primary: '#3B5AFE',
						background: '#0D1117',
						surface: '#161B22',
						text: '#FFFFFF'
					},
					spacing: [0, 4, 8, 12, 16]
				}
			};

			const element = service.renderUI(descriptor);

			expect(element).not.toBeNull();
			expect(mockLogger.info).toHaveBeenCalledWith(
				'[UIRendererService] Rendering UI',
				expect.objectContaining({
					nodeType: 'Container',
					nodeId: 'test-container'
				})
			);
		});

		it('should render nested components', () => {
			const descriptor: UIDescriptor = {
				layout: {
					id: 'root',
					type: 'Container',
					props: {},
					children: [
						{
							id: 'child-1',
							type: 'Text',
							props: { text: 'Hello' }
						},
						{
							id: 'child-2',
							type: 'Button',
							props: { text: 'Click' }
						}
					]
				},
				theme: {
					colors: {
						primary: '#3B5AFE',
						background: '#0D1117',
						surface: '#161B22',
						text: '#FFFFFF'
					},
					spacing: [0, 4, 8]
				}
			};

			const element = service.renderUI(descriptor);

			expect(element).not.toBeNull();
		});

		it('should handle unknown component type', () => {
			const descriptor: UIDescriptor = {
				layout: {
					id: 'unknown',
					type: 'UnknownComponent',
					props: {}
				},
				theme: {
					colors: {
						primary: '#3B5AFE',
						background: '#0D1117',
						surface: '#161B22',
						text: '#FFFFFF'
					},
					spacing: [0, 4, 8]
				}
			};

			const element = service.renderUI(descriptor);

			expect(element).toBeNull();
			expect(mockLogger.warn).toHaveBeenCalledWith(
				'[UIRendererService] Component not found',
				expect.objectContaining({ type: 'UnknownComponent' })
			);
		});
	});

	describe('registerComponent', () => {
		it('should register custom component', () => {
			const CustomComponent = (): JSX.Element => createElement('div', null, 'Custom');

			service.registerComponent('CustomComponent', CustomComponent);

			expect(service.hasComponent('CustomComponent')).toBe(true);
			expect(mockLogger.info).toHaveBeenCalledWith(
				'[UIRendererService] Registering component',
				{ type: 'CustomComponent' }
			);
		});

		it('should throw error for empty component type', () => {
			const CustomComponent = (): JSX.Element => createElement('div', null, 'Custom');

			expect(() => {
				service.registerComponent('', CustomComponent);
			}).toThrow('Component type cannot be empty');

			expect(mockLogger.error).toHaveBeenCalled();
		});
	});

	describe('hasComponent', () => {
		it('should return true for registered components', () => {
			expect(service.hasComponent('Container')).toBe(true);
			expect(service.hasComponent('Button')).toBe(true);
			expect(service.hasComponent('Text')).toBe(true);
		});

		it('should return false for unregistered components', () => {
			expect(service.hasComponent('UnknownComponent')).toBe(false);
		});
	});
});


