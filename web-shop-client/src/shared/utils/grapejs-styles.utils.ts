import type { GrapeJsStyle } from '../config/grapejs-app-config.types';

/**
 * Утилиты для работы со стилями GrapeJS компонентов
 */

export interface ComponentStyle {
  inline: Record<string, any>;
  classes: string[];
}

/**
 * Извлекает стили для конкретного компонента из массива стилей GrapeJS
 */
export function extractComponentStyles(
  component: any,
  allStyles: GrapeJsStyle[],
  componentPath: string = ''
): ComponentStyle {
  const inlineStyles: Record<string, any> = {};
  const classes: string[] = [...(component.classes || [])];

  allStyles.forEach((style) => {
    if (!style.style) return;

    let matches = false;

    // Проверяем selectorsAdd
    if (style.selectorsAdd && matchesGrapeSelector(component, style.selectorsAdd, componentPath)) {
      matches = true;
    }

    // Проверяем selectors array
    if (!matches && style.selectors) {
      for (const selector of style.selectors) {
        if (matchesGrapeSelector(component, selector, componentPath)) {
          matches = true;
          break;
        }
      }
    }

    // Если селектор совпадает, применяем стили
    if (matches) {
      // Копируем свойства стиля
      Object.assign(inlineStyles, style.style);

      // Если есть дополнительные классы в стиле, добавляем их
      if (style.classes) {
        classes.push(...style.classes);
      }
    }
  });

  // Если нет специфических стилей, пробуем применить все стили (упрощенный подход для отладки)
  if (Object.keys(inlineStyles).length === 0 && allStyles.length > 0) {
    // Применяем первые несколько стилей для тестирования
    allStyles.slice(0, 3).forEach((style) => {
      if (style.style) {
        Object.assign(inlineStyles, style.style);
      }
    });
  }

  return {
    inline: inlineStyles,
    classes: [...new Set(classes)] // Убираем дубликаты
  };
}

/**
 * Проверяет, соответствует ли селектор GrapeJS компоненту
 */
export function matchesGrapeSelector(
  component: any,
  selector: string,
  componentPath: string
): boolean {
  if (!selector || typeof selector !== 'string') return false;

  // Убираем лишние пробелы
  const cleanSelector = selector.trim();

  // Проверяем по ID
  if (component.attributes?.id && cleanSelector.includes(`#${component.attributes.id}`)) {
    return true;
  }

  // Проверяем по классам (с точкой)
  if (component.classes && Array.isArray(component.classes)) {
    for (const className of component.classes) {
      if (cleanSelector.includes(`.${className}`)) {
        return true;
      }
    }
  }

  // Проверяем по tagName
  if (component.tagName && cleanSelector === component.tagName) {
    return true;
  }

  // Проверяем по типу компонента
  if (component.type && cleanSelector.includes(`[data-type="${component.type}"]`)) {
    return true;
  }

  // Проверяем по data-атрибутам
  if (component.attributes) {
    for (const [key, value] of Object.entries(component.attributes)) {
      if (key.startsWith('data-') && cleanSelector.includes(`[${key}="${value}"]`)) {
        return true;
      }
    }
  }

  // Проверяем точное совпадение селектора с типом компонента
  if (component.type && cleanSelector === component.type) {
    return true;
  }

  // Проверяем если селектор - это просто класс без точки
  if (component.classes && Array.isArray(component.classes)) {
    for (const className of component.classes) {
      if (cleanSelector === className) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Преобразует CSS свойства в React-compatible формат
 */
export function transformCssToReact(cssStyles: Record<string, any>): Record<string, any> {
  const reactStyles: Record<string, any> = {};

  for (const [key, value] of Object.entries(cssStyles)) {
    // Преобразуем kebab-case в camelCase
    const reactKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

    // Преобразуем значения
    let reactValue = value;

    // Обрабатываем числовые значения с единицами измерения
    if (typeof value === 'string') {
      // Преобразуем CSS единицы в числа где возможно
      const numericMatch = value.match(/^(\d+(?:\.\d+)?)(px|rem|em|vh|vw|vmin|vmax|%)$/);
      if (numericMatch) {
        reactValue = parseFloat(numericMatch[1]);
        // Для некоторых свойств оставляем как строку
        if (!['fontSize', 'lineHeight', 'letterSpacing'].includes(reactKey)) {
          reactValue = value; // Оставляем как строку с единицей измерения
        }
      }

      // Обрабатываем специальные значения
      if (value === 'none') {
        reactValue = 'none';
      }
    }

    reactStyles[reactKey] = reactValue;
  }

  return reactStyles;
}

/**
 * Создает CSS классы из массива классов
 */
export function createClassName(classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Извлекает цвета из CSS переменных
 */
export function extractColorsFromCssVars(cssVars: Record<string, string>): Record<string, string> {
  const colors: Record<string, string> = {};

  // Ищем переменные цветов
  const colorVarNames = [
    '--tkn-color-sem-text-tx-primary',
    '--tkn-color-sem-text-tx-secondary',
    '--tkn-color-sem-bg-bg-base-primary',
    '--tkn-color-sem-bg-bg-overlay',
    '--color-primary',
    '--color-secondary',
    '--color-background',
    '--color-surface',
    '--color-text'
  ];

  for (const varName of colorVarNames) {
    if (cssVars[varName]) {
      const colorName = varName.replace('--tkn-color-sem-', '').replace('--color-', '').replace(/-/g, '');
      colors[colorName] = cssVars[varName];
    }
  }

  return colors;
}

/**
 * Применяет CSS переменные к inline стилям
 */
export function resolveCssVars(
  inlineStyles: Record<string, any>,
  cssVars: Record<string, string>
): Record<string, any> {
  const resolved: Record<string, any> = {};

  for (const [key, value] of Object.entries(inlineStyles)) {
    if (typeof value === 'string' && value.startsWith('var(')) {
      // Извлекаем имя переменной
      const varMatch = value.match(/var\((--[^,)]+)/);
      if (varMatch && cssVars[varMatch[1]]) {
        resolved[key] = cssVars[varMatch[1]];
      } else {
        resolved[key] = value; // Оставляем как есть если переменная не найдена
      }
    } else {
      resolved[key] = value;
    }
  }

  return resolved;
}