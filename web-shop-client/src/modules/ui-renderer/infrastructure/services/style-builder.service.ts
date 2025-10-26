import { injectable } from 'inversify';
import type { CSSProperties } from 'react';
import type { StyleConfig } from '../../domain/types';
import type { ThemeConfig } from '../../domain/value-objects/theme-config.value-object';

@injectable()
export class StyleBuilder {
  public buildClassName(styles: Readonly<StyleConfig>, theme?: ThemeConfig): string {
    const classes: string[] = [];

    if (typeof styles.padding === 'number') {
      classes.push(`p-${styles.padding}`);
    }

    // Обрабатываем w-full для width: 100%
    if (styles.width === '100%') {
      classes.push('w-full');
    }

    // Добавляем пользовательские классы
    if (styles.className) {
      classes.push(styles.className);
    }
    
    // Для цветов используем inline стили через theme, а не Tailwind классы
    // Tailwind классы остаются для других стилей
    
    return classes.join(' ');
  }

  public buildInlineStyles(styles: Readonly<StyleConfig>, theme?: ThemeConfig): CSSProperties {
    const inlineStyles: CSSProperties = {};

    if (styles.backgroundColor) {
      // Если это hex-код (начинается с #), используем напрямую
      if (typeof styles.backgroundColor === 'string' && styles.backgroundColor.startsWith('#')) {
        inlineStyles.backgroundColor = styles.backgroundColor;
      } else if (theme) {
        // Иначе ищем в теме
        const color = (theme.colors as any)[styles.backgroundColor];
        if (color) {
          inlineStyles.backgroundColor = color;
        }
      }
    }

    if (styles.textColor) {
      // Если это hex-код (начинается с #), используем напрямую
      if (typeof styles.textColor === 'string' && styles.textColor.startsWith('#')) {
        inlineStyles.color = styles.textColor;
      } else if (theme) {
        // Иначе ищем в теме
        const color = (theme.colors as any)[styles.textColor];
        if (color) {
          inlineStyles.color = color;
        }
      }
    }

    // Обрабатываем width как inline стиль (кроме 100%)
    if (styles.width !== undefined && styles.width !== '100%') {
      inlineStyles.width = styles.width;
    }

    if (styles.minHeight !== undefined) {
      inlineStyles.minHeight = styles.minHeight;
    }

    // Обрабатываем фоновые свойства
    if (styles.backgroundImage !== undefined) {
      inlineStyles.backgroundImage = styles.backgroundImage;
    }

    if (styles.backgroundSize !== undefined) {
      inlineStyles.backgroundSize = styles.backgroundSize;
    }

    if (styles.backgroundPosition !== undefined) {
      inlineStyles.backgroundPosition = styles.backgroundPosition;
    }

    if (styles.backgroundRepeat !== undefined) {
      inlineStyles.backgroundRepeat = styles.backgroundRepeat;
    }

    // Обрабатываем padding как inline стиль
    if (styles.padding !== undefined) {
      inlineStyles.padding = typeof styles.padding === 'number' ? `${styles.padding * 4}px` : styles.padding;
    }

    // Обрабатываем margin как inline стиль (для строковых значений)
    if (typeof styles.margin === 'string') {
      inlineStyles.margin = styles.margin;
    }

    // Обрабатываем marginBottom как inline стиль
    if (styles.marginBottom !== undefined) {
      inlineStyles.marginBottom = typeof styles.marginBottom === 'number' ? `${styles.marginBottom * 4}px` : styles.marginBottom;
    }

    // Обрабатываем borderRadius как inline стиль
    if (styles.borderRadius !== undefined) {
      inlineStyles.borderRadius = typeof styles.borderRadius === 'number' ? `${styles.borderRadius}px` : styles.borderRadius;
    }

    // Обрабатываем fontSize как inline стиль
    if (styles.fontSize !== undefined) {
      const fontSizeMap: Record<string, string> = {
        'xs': '12px',
        'sm': '14px', 
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px'
      };
      inlineStyles.fontSize = fontSizeMap[styles.fontSize] || styles.fontSize;
    }

    // Обрабатываем fontWeight как inline стиль
    if (styles.fontWeight !== undefined) {
      const fontWeightMap: Record<string, string> = {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800'
      };
      inlineStyles.fontWeight = fontWeightMap[styles.fontWeight] || styles.fontWeight;
    }

    if (styles.fontFamily !== undefined) {
      inlineStyles.fontFamily = styles.fontFamily;
    }

    // Обрабатываем height как inline стиль
    if (styles.height !== undefined) {
      inlineStyles.height = styles.height;
    }

    // Обрабатываем maxWidth как inline стиль
    if (styles.maxWidth !== undefined) {
      inlineStyles.maxWidth = styles.maxWidth;
    }

    // Обрабатываем maxHeight как inline стиль
    if (styles.maxHeight !== undefined) {
      inlineStyles.maxHeight = styles.maxHeight;
    }

    // Обрабатываем textAlign как inline стиль
    if (styles.textAlign !== undefined) {
      inlineStyles.textAlign = styles.textAlign;
    }

    // Обрабатываем justifyContent как inline стиль
    if (styles.justifyContent !== undefined) {
      inlineStyles.justifyContent = styles.justifyContent;
    }

    // Обрабатываем flex как inline стиль
    if (styles.flex !== undefined) {
      inlineStyles.flex = styles.flex;
    }

    if (styles.border !== undefined) {
      inlineStyles.border = styles.border;
    }

    // Обрабатываем position как inline стиль
    if (styles.position !== undefined) {
      inlineStyles.position = styles.position as any;
    }

    // Обрабатываем top как inline стиль
    if (styles.top !== undefined) {
      inlineStyles.top = styles.top;
    }

    // Обрабатываем left как inline стиль
    if (styles.left !== undefined) {
      inlineStyles.left = styles.left;
    }

    // Обрабатываем right как inline стиль
    if (styles.right !== undefined) {
      inlineStyles.right = styles.right;
    }

    // Обрабатываем bottom как inline стиль
    if (styles.bottom !== undefined) {
      inlineStyles.bottom = styles.bottom;
    }

    // Обрабатываем transform как inline стиль
    if (styles.transform !== undefined) {
      inlineStyles.transform = styles.transform;
    }

    // Обрабатываем zIndex как inline стиль
    if (styles.zIndex !== undefined) {
      inlineStyles.zIndex = styles.zIndex;
    }

    // Обрабатываем boxShadow как inline стиль
    if (styles.boxShadow !== undefined) {
      inlineStyles.boxShadow = styles.boxShadow;
    }

       return inlineStyles;
  }
}

    