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

        if (styles.width === '100%') {
      classes.push('w-full');
    }

        if (styles.className) {
      classes.push(styles.className);
    }
    
            
    return classes.join(' ');
  }

  public buildInlineStyles(styles: Readonly<StyleConfig>, theme?: ThemeConfig, componentType?: string): CSSProperties {
    const inlineStyles: CSSProperties = {};
    
        if (componentType === 'Text') {
      console.log('[StyleBuilder] Building inline styles for Text component', {
        textColor: styles.textColor,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        hasTheme: !!theme,
        themeColors: theme?.colors ? Object.keys(theme.colors) : [],
        allStyles: JSON.stringify(styles)
      });
    }

    if (styles.backgroundColor) {
            if (typeof styles.backgroundColor === 'string' && styles.backgroundColor.startsWith('#')) {
        inlineStyles.backgroundColor = styles.backgroundColor;
      } else if (theme?.colors) {
                const color = (theme.colors as any)[styles.backgroundColor];
        if (color) {
          inlineStyles.backgroundColor = color;
        }
      }
    }

    if (styles.textColor) {
            if (typeof styles.textColor === 'string' && styles.textColor.startsWith('#')) {
        inlineStyles.color = styles.textColor;
      } else if (theme?.colors) {
                const color = (theme.colors as any)[styles.textColor];
        if (color) {
          inlineStyles.color = color;
        } else {
                    inlineStyles.color = styles.textColor as string;
        }
      } else {
                inlineStyles.color = styles.textColor as string;
      }
    }

        if (styles.width !== undefined && styles.width !== '100%') {
      inlineStyles.width = styles.width;
    }

    if (styles.minHeight !== undefined) {
      inlineStyles.minHeight = styles.minHeight;
    }

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

        if (styles.padding !== undefined) {
      inlineStyles.padding = typeof styles.padding === 'number' ? `${styles.padding * 4}px` : styles.padding;
    }

        if (typeof styles.margin === 'string') {
      inlineStyles.margin = styles.margin;
    }

        if (styles.marginBottom !== undefined) {
      inlineStyles.marginBottom = typeof styles.marginBottom === 'number' ? `${styles.marginBottom * 4}px` : styles.marginBottom;
    }

        if (styles.borderRadius !== undefined) {
      inlineStyles.borderRadius = typeof styles.borderRadius === 'number' ? `${styles.borderRadius}px` : styles.borderRadius;
    }

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

        if (styles.height !== undefined) {
      inlineStyles.height = styles.height;
    }

        if (styles.maxWidth !== undefined) {
      inlineStyles.maxWidth = styles.maxWidth;
    }

        if (styles.maxHeight !== undefined) {
      inlineStyles.maxHeight = styles.maxHeight;
    }

            if (styles.textAlign !== undefined) {
      if (componentType === 'Button') {
        const justifyContentMap: Record<string, string> = {
          'left': 'flex-start',
          'center': 'center',
          'right': 'flex-end',
        };
        inlineStyles.justifyContent = justifyContentMap[styles.textAlign] || 'center';
      } else {
        inlineStyles.textAlign = styles.textAlign;
      }
    }

        if (styles.textDecoration !== undefined) {
      inlineStyles.textDecoration = styles.textDecoration;
    }

        if (styles.justifyContent !== undefined) {
      inlineStyles.justifyContent = styles.justifyContent;
    }

        if (styles.flex !== undefined) {
      inlineStyles.flex = styles.flex;
    }

            let borderColorValue: string | undefined;
    if (styles.borderColor !== undefined) {
            if (typeof styles.borderColor === 'string' && styles.borderColor.startsWith('#')) {
        borderColorValue = styles.borderColor;
        inlineStyles.borderColor = borderColorValue;
      } else if (theme?.colors) {
                const color = (theme.colors as any)[styles.borderColor];
        if (color) {
          borderColorValue = color;
          inlineStyles.borderColor = borderColorValue;
        }
      } else {
                borderColorValue = styles.borderColor as string;
        inlineStyles.borderColor = borderColorValue;
      }
    }

        if (styles.border !== undefined) {
      inlineStyles.border = styles.border;
    } else if (borderColorValue && !inlineStyles.border) {
                  const borderWidth = styles.borderWidth || '1px';
      const borderStyle = styles.borderStyle || 'solid';
      inlineStyles.border = `${borderWidth} ${borderStyle} ${borderColorValue}`;
    }

        if (styles.position !== undefined) {
      inlineStyles.position = styles.position as any;
    }

        if (styles.top !== undefined) {
      inlineStyles.top = styles.top;
    }

        if (styles.left !== undefined) {
      inlineStyles.left = styles.left;
    }

        if (styles.right !== undefined) {
      inlineStyles.right = styles.right;
    }

        if (styles.bottom !== undefined) {
      inlineStyles.bottom = styles.bottom;
    }

        if (styles.transform !== undefined) {
      inlineStyles.transform = styles.transform;
    }

        if (styles.zIndex !== undefined) {
      inlineStyles.zIndex = styles.zIndex;
    }

        if (styles.boxShadow !== undefined) {
      inlineStyles.boxShadow = styles.boxShadow;
    }

       return inlineStyles;
  }
}

    