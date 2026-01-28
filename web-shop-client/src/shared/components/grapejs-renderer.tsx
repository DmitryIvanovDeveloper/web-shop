import React from 'react';
import type { GrapeJsAppConfig, GrapeJsStyle } from '../config/grapejs-app-config.types';
import { extractComponentStyles, transformCssToReact, createClassName } from '../utils/grapejs-styles.utils';
import { createClickHandler } from '../utils/grapejs-actions.utils';

interface GrapeJsRendererProps {
  grapeJsConfig: GrapeJsAppConfig;
  className?: string;
}

export const GrapeJsRenderer: React.FC<GrapeJsRendererProps> = ({
  grapeJsConfig,
  className = ''
}) => {
  // Получаем корневой компонент страницы
  const rootComponent = grapeJsConfig.pages[0]?.frames[0]?.component;

  if (!rootComponent) {
    return (
      <div className={`grapejs-renderer ${className}`}>
        <div className="text-center p-8 text-gray-500">
          No content to render
        </div>
      </div>
    );
  }

  return (
    <div className={`grapejs-renderer ${className}`}>
      <GrapeJsComponentRenderer
        component={rootComponent}
        styles={grapeJsConfig.styles}
        assets={grapeJsConfig.assets}
      />
    </div>
  );
};

interface GrapeJsComponentRendererProps {
  component: any; // GrapeJS component structure
  styles: GrapeJsStyle[];
  assets?: any[];
  parentPath?: string;
}

const GrapeJsComponentRenderer: React.FC<GrapeJsComponentRendererProps> = ({
  component,
  styles,
  assets = [],
  parentPath = ''
}) => {
  if (!component) return null;

  // Создаем уникальный путь для компонента
  const currentPath = parentPath ? `${parentPath}-${component.attributes?.id || 'anon'}` : (component.attributes?.id || 'root');

  // Получаем стили для этого компонента
  const { inline: componentStyles, classes: componentClasses } = extractComponentStyles(component, styles, currentPath);

  // Преобразуем CSS стили в React формат
  const reactStyles = transformCssToReact(componentStyles);

  // Создаем финальный className
  const className = createClassName(componentClasses);

  // Определяем тип компонента
  const componentType = component.type || 'container';

  // Обрабатываем разные типы компонентов
  switch (componentType) {
    case 'text':
    case 'textnode':
      return renderTextComponent(component, reactStyles, className, styles, assets, currentPath);

    case 'button':
      return renderButtonComponent(component, reactStyles, className, styles, assets, currentPath);

    case 'image':
      return renderImageComponent(component, reactStyles, className, styles, assets, currentPath);

    case 'link':
      return renderLinkComponent(component, reactStyles, className, styles, assets, currentPath);

    default:
      return renderContainerComponent(component, reactStyles, className, styles, assets, currentPath);
  }
};

// Функции рендеринга для разных типов компонентов
function renderTextComponent(
  component: any,
  styles: any,
  className: string,
  allStyles: GrapeJsStyle[],
  assets: any[],
  path: string
) {
  const Tag = component.tagName || 'span';
  const content = component.content || '';
  const hasChildren = component.components && component.components.length > 0;

  // ДОПОЛНИТЕЛЬНЫЕ СТИЛИ: применяем все доступные стили для тестирования
  const enhancedStyles = { ...styles };

  // Применяем все стили из массива для отладки
  allStyles.forEach((style) => {
    if (style.style) {
      Object.assign(enhancedStyles, style.style);
    }
  });

  return (
    <Tag
      className={className}
      style={enhancedStyles}
      {...component.attributes}
    >
      {content}
      {hasChildren && component.components.map((child: any, index: number) => (
        <GrapeJsComponentRenderer
          key={`${path}-child-${index}`}
          component={child}
          styles={allStyles}
          assets={assets}
          parentPath={path}
        />
      ))}
    </Tag>
  );
}

function renderButtonComponent(
  component: any,
  styles: any,
  className: string,
  allStyles: GrapeJsStyle[],
  assets: any[],
  path: string
) {
  const handleClick = createClickHandler(component.actions?.onClick);

  return (
    <button
      className={className}
      style={styles}
      onClick={handleClick}
      {...component.attributes}
    >
      {component.props?.icon && (
        <span className="mr-2">{component.props.icon}</span>
      )}
      {component.props?.text}
      {component.components?.map((child: any, index: number) => (
        <GrapeJsComponentRenderer
          key={`${path}-child-${index}`}
          component={child}
          styles={allStyles}
          assets={assets}
          parentPath={path}
        />
      ))}
    </button>
  );
}

function renderImageComponent(
  component: any,
  styles: any,
  className: string,
  allStyles: GrapeJsStyle[],
  assets: any[],
  path: string
) {
  const src = component.attributes?.src || component.props?.src || '';

  return (
    <img
      className={className}
      style={styles}
      src={src}
      alt={component.attributes?.alt || component.props?.alt || ''}
      {...component.attributes}
    />
  );
}

function renderLinkComponent(
  component: any,
  styles: any,
  className: string,
  allStyles: GrapeJsStyle[],
  assets: any[],
  path: string
) {
  const handleClick = createClickHandler(component.actions?.onClick);

  return (
    <a
      className={className}
      style={styles}
      onClick={handleClick}
      {...component.attributes}
    >
      {component.props?.text}
      {component.components?.map((child: any, index: number) => (
        <GrapeJsComponentRenderer
          key={`${path}-child-${index}`}
          component={child}
          styles={allStyles}
          assets={assets}
          parentPath={path}
        />
      ))}
    </a>
  );
}

function renderContainerComponent(
  component: any,
  styles: any,
  className: string,
  allStyles: GrapeJsStyle[],
  assets: any[],
  path: string
) {
  const Tag = component.tagName || 'div';

  return (
    <Tag
      className={className}
      style={styles}
      {...component.attributes}
    >
      {component.components?.map((child: any, index: number) => (
        <GrapeJsComponentRenderer
          key={`${path}-child-${index}`}
          component={child}
          styles={allStyles}
          assets={assets}
          parentPath={path}
        />
      ))}
    </Tag>
  );
}
