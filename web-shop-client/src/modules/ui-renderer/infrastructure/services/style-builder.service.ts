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
    
    // Для цветов используем inline стили через theme, а не Tailwind классы
    // Tailwind классы остаются для других стилей
    
    return classes.join(' ');
  }

  public buildInlineStyles(styles: Readonly<StyleConfig>, theme?: ThemeConfig): CSSProperties {
    const inlineStyles: CSSProperties = {};

    if (theme && styles.backgroundColor) {
      const color = (theme.colors as any)[styles.backgroundColor];
      if (color) {
        inlineStyles.backgroundColor = color;
      }
    }

    if (theme && styles.textColor) {
      const color = (theme.colors as any)[styles.textColor];
      if (color) {
        inlineStyles.color = color;
      }
    }

    // Обрабатываем размеры для w-full и min-h-screen
    if (styles.width !== undefined) {
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

    return inlineStyles;
  }
}

    