/**
 * Style Builder Service - Unit Tests
 * Тесты преобразования StyleConfig в CSS
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UIStyleBuilder } from '../style-builder.service';
import type { StyleConfig } from '../../../../shared/ui/style-config';
import type { ThemeConfig } from '../../../../shared/ui/theme-config';

describe('UIStyleBuilder', () => {
	let styleBuilder: UIStyleBuilder;
	let theme: ThemeConfig;

	beforeEach(() => {
		styleBuilder = new UIStyleBuilder();

		theme = {
			colors: {
				primary: '#3B5AFE',
				background: '#0D1117',
				surface: '#161B22',
				text: '#FFFFFF',
				textSecondary: '#A0A0A0'
			},
			spacing: [0, 4, 8, 12, 16, 20, 24, 32]
		};
	});

	describe('buildClassName', () => {
		it('should build Tailwind classes from padding', () => {
			const styles: StyleConfig = { padding: 4 };

			const className = styleBuilder.buildClassName(styles);

			expect(className).toContain('p-4');
		});

		it('should build w-full for 100% width', () => {
			const styles: StyleConfig = { width: '100%' };

			const className = styleBuilder.buildClassName(styles);

			expect(className).toContain('w-full');
		});

		it('should include custom className', () => {
			const styles: StyleConfig = { className: 'custom-class another-class' };

			const className = styleBuilder.buildClassName(styles);

			expect(className).toBe('custom-class another-class');
		});

		it('should combine multiple classes', () => {
			const styles: StyleConfig = {
				padding: 4,
				width: '100%',
				className: 'custom'
			};

			const className = styleBuilder.buildClassName(styles);

			expect(className).toContain('p-4');
			expect(className).toContain('w-full');
			expect(className).toContain('custom');
		});
	});

	describe('buildInlineStyles', () => {
		it('should resolve backgroundColor from theme', () => {
			const styles: StyleConfig = { backgroundColor: 'primary' };

			const inlineStyles = styleBuilder.buildInlineStyles(styles, theme);

			expect(inlineStyles.backgroundColor).toBe('#3B5AFE');
		});

		it('should use hex color directly', () => {
			const styles: StyleConfig = { backgroundColor: '#FF0000' };

			const inlineStyles = styleBuilder.buildInlineStyles(styles, theme);

			expect(inlineStyles.backgroundColor).toBe('#FF0000');
		});

		it('should resolve textColor from theme', () => {
			const styles: StyleConfig = { textColor: 'text' };

			const inlineStyles = styleBuilder.buildInlineStyles(styles, theme);

			expect(inlineStyles.color).toBe('#FFFFFF');
		});

		it('should convert fontSize from predefined values', () => {
			const styles: StyleConfig = { fontSize: '2xl' };

			const inlineStyles = styleBuilder.buildInlineStyles(styles);

			expect(inlineStyles.fontSize).toBe('24px');
		});

		it('should convert fontWeight from string to number', () => {
			const styles: StyleConfig = { fontWeight: 'bold' };

			const inlineStyles = styleBuilder.buildInlineStyles(styles);

			expect(inlineStyles.fontWeight).toBe(700);
		});

		it('should convert numeric spacing to pixels', () => {
			const styles: StyleConfig = {
				padding: 4,
				margin: 8
			};

			const inlineStyles = styleBuilder.buildInlineStyles(styles);

			expect(inlineStyles.padding).toBe('16px'); // 4 * 4
			expect(inlineStyles.margin).toBe('32px'); // 8 * 4
		});

		it('should handle string spacing values', () => {
			const styles: StyleConfig = {
				margin: 'auto',
				padding: '10px 20px'
			};

			const inlineStyles = styleBuilder.buildInlineStyles(styles);

			expect(inlineStyles.margin).toBe('auto');
			expect(inlineStyles.padding).toBe('10px 20px');
		});

		it('should build complete inline styles', () => {
			const styles: StyleConfig = {
				backgroundColor: 'surface',
				textColor: 'text',
				fontSize: 'lg',
				fontWeight: 'bold',
				padding: 4,
				borderRadius: 8,
				display: 'flex',
				justifyContent: 'center'
			};

			const inlineStyles = styleBuilder.buildInlineStyles(styles, theme);

			expect(inlineStyles.backgroundColor).toBe('#161B22');
			expect(inlineStyles.color).toBe('#FFFFFF');
			expect(inlineStyles.fontSize).toBe('18px');
			expect(inlineStyles.fontWeight).toBe(700);
			expect(inlineStyles.padding).toBe('16px');
			expect(inlineStyles.borderRadius).toBe('8px');
			expect(inlineStyles.display).toBe('flex');
			expect(inlineStyles.justifyContent).toBe('center');
		});
	});
});


