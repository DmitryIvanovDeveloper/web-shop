/**
 * UI Style Builder Service
 * Универсальный сервис для построения стилей из StyleConfig
 */

import { injectable } from 'inversify';
import type { ThemeConfig, StyleConfig } from '../../../shared/ui';

@injectable()
export class UIStyleBuilder {
	/**
	 * Строит className из StyleConfig и ThemeConfig
	 */
	public buildClassName(styles: StyleConfig | undefined, theme: ThemeConfig): string {
		if (!styles) return '';

		const classes: string[] = [];

		// Используем className если есть
		if (styles.className) {
			classes.push(styles.className);
		}

		return classes.join(' ');
	}

	/**
	 * Строит inline styles из StyleConfig и ThemeConfig
	 */
	public buildInlineStyles(
		styles: StyleConfig | undefined,
		theme: ThemeConfig
	): React.CSSProperties {
		if (!styles) return {};

		console.log('[UIStyleBuilder] Building inline styles', {
			hasStyles: !!styles,
			stylesKeys: Object.keys(styles),
			backgroundColor: styles.backgroundColor,
			backgroundOpacity: styles.backgroundOpacity,
			color: styles.color,
			textColor: styles.textColor,
			borderColor: styles.borderColor,
			borderRadius: styles.borderRadius,
			borderWidth: styles.borderWidth,
			padding: styles.padding
		});

		const inlineStyles: React.CSSProperties = {};

		// Layout
		if (styles.display) inlineStyles.display = styles.display;
		if (styles.flexDirection) inlineStyles.flexDirection = styles.flexDirection;
		if (styles.justifyContent) inlineStyles.justifyContent = styles.justifyContent;
		if (styles.alignItems) inlineStyles.alignItems = styles.alignItems;
		if (styles.flex) inlineStyles.flex = styles.flex;
		if (typeof styles.gap === 'number') {
			if (theme?.spacing) {
				inlineStyles.gap = `${theme.spacing[styles.gap]}px`;
			}
		} else if (typeof styles.gap === 'string') {
			inlineStyles.gap = styles.gap;
		}

		// Grid
		if (styles.gridTemplateColumns) inlineStyles.gridTemplateColumns = styles.gridTemplateColumns;

		// Spacing
		if (typeof styles.padding === 'number') {
			if (theme?.spacing) {
				inlineStyles.padding = `${theme.spacing[styles.padding]}px`;
			}
		} else if (typeof styles.padding === 'string') {
			inlineStyles.padding = styles.padding;
		}
		if (typeof styles.paddingX === 'number') {
			if (theme?.spacing) {
				inlineStyles.paddingLeft = `${theme.spacing[styles.paddingX]}px`;
				inlineStyles.paddingRight = `${theme.spacing[styles.paddingX]}px`;
			}
		}
		if (typeof styles.paddingY === 'number') {
			if (theme?.spacing) {
				inlineStyles.paddingTop = `${theme.spacing[styles.paddingY]}px`;
				inlineStyles.paddingBottom = `${theme.spacing[styles.paddingY]}px`;
			}
		}
		if (typeof styles.margin === 'number') {
			if (theme?.spacing) {
				inlineStyles.margin = `${theme.spacing[styles.margin]}px`;
			}
		} else if (typeof styles.margin === 'string') {
			inlineStyles.margin = styles.margin;
		}
		if (typeof styles.marginTop === 'number') {
			if (theme?.spacing) {
				inlineStyles.marginTop = `${theme.spacing[styles.marginTop]}px`;
			}
		}
		if (typeof styles.marginBottom === 'number') {
			if (theme?.spacing) {
				inlineStyles.marginBottom = `${theme.spacing[styles.marginBottom]}px`;
			}
		}

		// Colors
		let resolvedBackgroundColor: string | undefined;
		if (styles.backgroundColor) {
			resolvedBackgroundColor = this._resolveColor(styles.backgroundColor, theme);
			inlineStyles.backgroundColor = resolvedBackgroundColor;
		}
		if (styles.backgroundOpacity !== undefined) {
			const opacity = typeof styles.backgroundOpacity === 'number'
				? styles.backgroundOpacity
				: Number.parseFloat(styles.backgroundOpacity as string);
			if (!Number.isNaN(opacity)) {
				const baseColor = resolvedBackgroundColor ?? (inlineStyles.backgroundColor as string | undefined);
				if (baseColor) {
					inlineStyles.backgroundColor = this._applyOpacityToColor(baseColor, opacity);
				}
			}
		}
		// Support both 'color' (direct CSS property) and 'textColor' (theme-based)
		if (styles.color) {
			inlineStyles.color = this._resolveColor(styles.color as string, theme);
		} else if (styles.textColor) {
			inlineStyles.color = this._resolveColor(styles.textColor, theme);
		}

		// Typography
		if (styles.fontSize) inlineStyles.fontSize = styles.fontSize;
		if (styles.fontWeight) inlineStyles.fontWeight = styles.fontWeight;
		if (styles.fontFamily) inlineStyles.fontFamily = styles.fontFamily;
		if (styles.textAlign) inlineStyles.textAlign = styles.textAlign;
		if (styles.textDecoration) inlineStyles.textDecoration = styles.textDecoration;

		// Size
		if (styles.width) inlineStyles.width = styles.width;
		if (styles.height) inlineStyles.height = styles.height;
		if (styles.minHeight) inlineStyles.minHeight = styles.minHeight;
		if (styles.maxWidth) inlineStyles.maxWidth = styles.maxWidth;
		if (styles.maxHeight) inlineStyles.maxHeight = styles.maxHeight;

		// Position
		if (styles.position) inlineStyles.position = styles.position;
		if (typeof styles.top === 'number') {
			if (theme?.spacing) {
				inlineStyles.top = `${theme.spacing[styles.top]}px`;
			}
		}
		if (typeof styles.left === 'number') {
			if (theme?.spacing) {
				inlineStyles.left = `${theme.spacing[styles.left]}px`;
			}
		}
		if (typeof styles.right === 'number') {
			if (theme?.spacing) {
				inlineStyles.right = `${theme.spacing[styles.right]}px`;
			}
		}
		if (typeof styles.bottom === 'number') {
			if (theme?.spacing) {
				inlineStyles.bottom = `${theme.spacing[styles.bottom]}px`;
			}
		}
		if (typeof styles.zIndex === 'number') {
			inlineStyles.zIndex = styles.zIndex;
		}

		// Visual
		if (typeof styles.borderRadius === 'number') {
			if (theme?.spacing) {
				inlineStyles.borderRadius = `${theme.spacing[styles.borderRadius]}px`;
			}
		} else if (typeof styles.borderRadius === 'string') {
			inlineStyles.borderRadius = styles.borderRadius;
		}
        if (styles.border) inlineStyles.border = styles.border;
		if (styles.borderColor) inlineStyles.borderColor = this._resolveColor(styles.borderColor, theme);
		if (styles.borderWidth) inlineStyles.borderWidth = styles.borderWidth;
		if (styles.borderStyle) inlineStyles.borderStyle = styles.borderStyle;
		if (styles.overflow) inlineStyles.overflow = styles.overflow;
		if (styles.objectFit) inlineStyles.objectFit = styles.objectFit;
        if (styles.filter) inlineStyles.filter = styles.filter;

		// Background
		if (styles.backgroundImage) inlineStyles.backgroundImage = styles.backgroundImage;
		if (styles.backgroundSize) inlineStyles.backgroundSize = styles.backgroundSize;
		if (styles.backgroundPosition) inlineStyles.backgroundPosition = styles.backgroundPosition;
		if (styles.backgroundRepeat) inlineStyles.backgroundRepeat = styles.backgroundRepeat;

		console.log('[UIStyleBuilder] Built inline styles', {
			inlineStylesKeys: Object.keys(inlineStyles),
			backgroundColor: inlineStyles.backgroundColor,
			backgroundOpacity:
				typeof styles.backgroundOpacity !== 'undefined'
					? styles.backgroundOpacity
					: undefined,
			color: inlineStyles.color,
			borderColor: inlineStyles.borderColor,
			borderRadius: inlineStyles.borderRadius,
			borderWidth: inlineStyles.borderWidth,
			padding: inlineStyles.padding
		});

		return inlineStyles;
	}

	/**
	 * Resolve color from theme or use as-is
	 */
	private _resolveColor(color: string, theme: ThemeConfig): string {
		// If it's a theme color reference, resolve it
		if (theme?.colors) {
			const colors = theme.colors as Record<string, string>;
			if (colors && colors[color]) {
				return colors[color];
			}
		}
		// Otherwise use as-is (hex, rgb, etc.)
		return color;
	}

	private _applyOpacityToColor(color: string, opacity: number): string {
		const clamped = Math.min(1, Math.max(0, opacity));

		if (color.startsWith('#')) {
			let hex = color.slice(1);
			if (hex.length === 3) {
				hex = hex.split('').map((char) => char + char).join('');
			}
			if (hex.length === 6) {
				const r = Number.parseInt(hex.slice(0, 2), 16);
				const g = Number.parseInt(hex.slice(2, 4), 16);
				const b = Number.parseInt(hex.slice(4, 6), 16);
				return `rgba(${r}, ${g}, ${b}, ${clamped})`;
			}
		}

		const rgbaMatch = color.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*[\d.]+\s*\)$/i);
		if (rgbaMatch) {
			const [, r, g, b] = rgbaMatch;
			return `rgba(${r}, ${g}, ${b}, ${clamped})`;
		}

		const rgbMatch = color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
		if (rgbMatch) {
			const [, r, g, b] = rgbMatch;
			return `rgba(${r}, ${g}, ${b}, ${clamped})`;
		}

		return color;
	}
}

