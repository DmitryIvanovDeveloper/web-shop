/**
 * Component Registry Service - Unit Tests
 * Тесты регистрации компонентов
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UIComponentRegistry } from '../component-registry.service';
import { createElement } from 'react';

describe('UIComponentRegistry', () => {
	let registry: UIComponentRegistry;

	beforeEach(() => {
		registry = new UIComponentRegistry();
	});

	describe('Default components', () => {
		it('should have Container component registered', () => {
			expect(registry.hasComponent('Container')).toBe(true);
			expect(registry.getComponent('Container')).not.toBeNull();
		});

		it('should have Button component registered', () => {
			expect(registry.hasComponent('Button')).toBe(true);
			expect(registry.getComponent('Button')).not.toBeNull();
		});

		it('should have Text component registered', () => {
			expect(registry.hasComponent('Text')).toBe(true);
			expect(registry.getComponent('Text')).not.toBeNull();
		});

		it('should have Grid component registered', () => {
			expect(registry.hasComponent('Grid')).toBe(true);
			expect(registry.getComponent('Grid')).not.toBeNull();
		});

		it('should have all default components', () => {
			const expectedComponents = [
				'Container', 'Grid', 'DataGrid',
				'Button', 'Text', 'Input', 'Image', 'Badge',
				'UniversalInput', 'OfferCard', 'Popup'
			];

			for (const type of expectedComponents) {
				expect(registry.hasComponent(type)).toBe(true);
			}
		});
	});

	describe('register', () => {
		it('should register custom component', () => {
			const CustomComponent = (): JSX.Element => createElement('div', null, 'Custom');

			registry.register('CustomComponent', CustomComponent);

			expect(registry.hasComponent('CustomComponent')).toBe(true);
			expect(registry.getComponent('CustomComponent')).toBe(CustomComponent);
		});

		it('should override existing component', () => {
			const NewButton = (): JSX.Element => createElement('button', null, 'New');

			registry.register('Button', NewButton);

			expect(registry.getComponent('Button')).toBe(NewButton);
		});

		it('should throw error for empty type', () => {
			const CustomComponent = (): JSX.Element => createElement('div', null, 'Custom');

			expect(() => {
				registry.register('', CustomComponent);
			}).toThrow('Component type cannot be empty');
		});
	});

	describe('getComponent', () => {
		it('should return null for unknown component', () => {
			const component = registry.getComponent('UnknownComponent');

			expect(component).toBeNull();
		});

		it('should return registered component', () => {
			const component = registry.getComponent('Button');

			expect(component).not.toBeNull();
		});
	});

	describe('getRegisteredTypes', () => {
		it('should return all registered types', () => {
			const types = registry.getRegisteredTypes();

			expect(types).toContain('Container');
			expect(types).toContain('Button');
			expect(types).toContain('Text');
			expect(types.length).toBeGreaterThan(0);
		});
	});
});


