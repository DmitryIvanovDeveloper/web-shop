'use client';

import React from 'react';
import type { ComponentNode } from '../../../domain/entities/page-section.entity';

interface ComponentEditorProps {
  component: ComponentNode;
  onUpdate: (props: Record<string, unknown>) => void;
  onRemove: () => void;
}

export function ComponentEditor({ component, onUpdate, onRemove }: ComponentEditorProps): JSX.Element {
  const renderPropsEditor = () => {
    switch (component.type) {
      case 'Text':
        {
          // Маппинг размеров заголовков
          const headingSizes: Record<string, string> = {
            h1: '2.5rem',
            h2: '2rem',
            h3: '1.75rem',
            h4: '1.5rem',
            h5: '1.25rem',
            h6: '1.125rem',
            p: '1rem',
          };

          // Определяем тип текста и размер заголовка
          const fontSize = (component.styles?.fontSize as string) || '1rem';
          const fontSizeNum = parseFloat(fontSize) || 1;
          
          // Определяем, какой заголовок соответствует текущему размеру
          let headingSize = 'p';
          let textType: 'heading' | 'paragraph' = 'paragraph';
          
          // Проверяем точное совпадение с размерами заголовков
          const sizeEntries = Object.entries(headingSizes);
          for (const [key, value] of sizeEntries) {
            if (key !== 'p' && fontSize === value) {
              headingSize = key;
              textType = 'heading';
              break;
            }
          }
          
          // Если не найдено точное совпадение, пытаемся определить по числовому значению
          if (textType === 'paragraph') {
            if (fontSizeNum >= 2.5) {
              headingSize = 'h1';
              textType = 'heading';
            } else if (fontSizeNum >= 2) {
              headingSize = 'h2';
              textType = 'heading';
            } else if (fontSizeNum >= 1.75) {
              headingSize = 'h3';
              textType = 'heading';
            } else if (fontSizeNum >= 1.5) {
              headingSize = 'h4';
              textType = 'heading';
            } else if (fontSizeNum >= 1.25) {
              headingSize = 'h5';
              textType = 'heading';
            } else if (fontSizeNum >= 1.125) {
              headingSize = 'h6';
              textType = 'heading';
            }
          }

          return (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Text Content
                </label>
                <textarea
                  value={(component.props?.text as string) || ''}
                  onChange={(e) => onUpdate({ ...component.props, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={4}
                  placeholder="Enter text here..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Text Type
                </label>
                <select
                  value={textType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    const newStyles = { ...component.styles };
                    
                    if (newType === 'heading') {
                      // Если переключаемся на заголовок, используем H2 по умолчанию
                      newStyles.fontSize = headingSizes.h2;
                      newStyles.fontWeight = 'bold';
                    } else {
                      // Если переключаемся на параграф, обычный текст
                      newStyles.fontSize = headingSizes.p;
                      newStyles.fontWeight = 'normal';
                    }
                    
                    onUpdate({ ...component.props, styles: newStyles });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="paragraph">Paragraph (Normal Text)</option>
                  <option value="heading">Heading</option>
                </select>
              </div>

              {textType === 'heading' && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Heading Size
                  </label>
                  <select
                    value={headingSize}
                    onChange={(e) => {
                      const newSize = e.target.value;
                      const newStyles = { ...component.styles };
                      
                      newStyles.fontSize = headingSizes[newSize];
                      newStyles.fontWeight = 'bold';
                      
                      onUpdate({ ...component.props, styles: newStyles });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="h1">H1 (Largest)</option>
                    <option value="h2">H2 (Large)</option>
                    <option value="h3">H3 (Medium-Large)</option>
                    <option value="h4">H4 (Medium)</option>
                    <option value="h5">H5 (Small)</option>
                    <option value="h6">H6 (Smallest)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(component.styles?.color as string) || '#000000'}
                    onChange={(e) => {
                      const newStyles = { ...component.styles, color: e.target.value };
                      onUpdate({ ...component.props, styles: newStyles });
                    }}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={(component.styles?.color as string) || '#000000'}
                    onChange={(e) => {
                      const newStyles = { ...component.styles, color: e.target.value };
                      onUpdate({ ...component.props, styles: newStyles });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="#000000"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Examples: #000000, #FF5733, rgb(255, 87, 51)</p>
              </div>
            </div>
          );
        }

      case 'Button':
        return (
          <div className="space-y-4">
            {/* Properties Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Properties</h4>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Button Label
                </label>
                <input
                  type="text"
                  value={(component.props?.text as string) || ''}
                  onChange={(e) => onUpdate({ ...component.props, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Click me"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Action (URL or function)
                </label>
                <input
                  type="text"
                  value={(component.props?.onClick as string) || ''}
                  onChange={(e) => onUpdate({ ...component.props, onClick: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                  placeholder="/shop"
                />
              </div>
            </div>

            {/* Styles Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Styles</h4>
              
              {/* Background Color */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(component.styles?.backgroundColor as string) || '#3b82f6'}
                    onChange={(e) => {
                      const newStyles = { ...component.styles, backgroundColor: e.target.value };
                      onUpdate({ ...component.props, styles: newStyles });
                    }}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={(component.styles?.backgroundColor as string) || '#3b82f6'}
                    onChange={(e) => {
                      const newStyles = { ...component.styles, backgroundColor: e.target.value };
                      onUpdate({ ...component.props, styles: newStyles });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="#3b82f6"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Examples: #3b82f6, #FF5733, rgb(59, 130, 246)</p>
              </div>

              {/* Text Color */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(component.styles?.color as string) || (component.styles?.textColor as string) || '#ffffff'}
                    onChange={(e) => {
                      const newStyles = { ...component.styles, color: e.target.value };
                      onUpdate({ ...component.props, styles: newStyles });
                    }}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={(component.styles?.color as string) || (component.styles?.textColor as string) || '#ffffff'}
                    onChange={(e) => {
                      const newStyles = { ...component.styles, color: e.target.value };
                      onUpdate({ ...component.props, styles: newStyles });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="#ffffff"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Examples: #ffffff, #000000, rgb(255, 255, 255)</p>
              </div>

              {/* Border Color */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Border Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(component.styles?.borderColor as string) || '#3b82f6'}
                    onChange={(e) => {
                      const newStyles = { ...component.styles, borderColor: e.target.value };
                      onUpdate({ ...component.props, styles: newStyles });
                    }}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={(component.styles?.borderColor as string) || '#3b82f6'}
                    onChange={(e) => {
                      const newStyles = { ...component.styles, borderColor: e.target.value };
                      onUpdate({ ...component.props, styles: newStyles });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Border Radius
                </label>
                <div className="flex items-center gap-2">
                  {(() => {
                    const parseBorderRadius = (borderRadius: string | number | undefined): { value: number; unit: string } => {
                      if (!borderRadius) return { value: 8, unit: 'px' };
                      const br = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
                      const match = br.match(/^([\d.]+)\s*(px|rem|em|%)$/);
                      if (match) {
                        return { value: parseFloat(match[1]), unit: match[2] };
                      }
                      return { value: 8, unit: 'px' };
                    };

                    const { value: borderRadiusValue, unit: borderRadiusUnit } = parseBorderRadius(
                      component.styles?.borderRadius as string | number | undefined
                    );

                    const handleBorderRadiusValueChange = (newValue: string): void => {
                      if (newValue) {
                        const newStyles = { ...component.styles, borderRadius: `${newValue}${borderRadiusUnit}` };
                        onUpdate({ ...component.props, styles: newStyles });
                      } else {
                        const newStyles = { ...component.styles, borderRadius: undefined };
                        onUpdate({ ...component.props, styles: newStyles });
                      }
                    };

                    const handleBorderRadiusUnitChange = (newUnit: string): void => {
                      const newStyles = { ...component.styles, borderRadius: `${borderRadiusValue}${newUnit}` };
                      onUpdate({ ...component.props, styles: newStyles });
                    };

                    return (
                      <>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={borderRadiusValue}
                          onChange={(e) => handleBorderRadiusValueChange(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                          placeholder="8"
                        />
                        <select
                          value={borderRadiusUnit}
                          onChange={(e) => handleBorderRadiusUnitChange(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="px">px</option>
                          <option value="rem">rem</option>
                          <option value="em">em</option>
                          <option value="%">%</option>
                        </select>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Padding */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Padding
                </label>
                <div className="flex items-center gap-2">
                  {(() => {
                    const parsePadding = (padding: string | number | undefined): { value: number; unit: string } => {
                      if (!padding) return { value: 8, unit: 'px' };
                      const pad = typeof padding === 'number' ? `${padding}px` : padding;
                      const match = pad.match(/^([\d.]+)\s*(px|rem|em|%)$/);
                      if (match) {
                        return { value: parseFloat(match[1]), unit: match[2] };
                      }
                      return { value: 8, unit: 'px' };
                    };

                    const { value: paddingValue, unit: paddingUnit } = parsePadding(
                      component.styles?.padding as string | number | undefined
                    );

                    const handlePaddingValueChange = (newValue: string): void => {
                      if (newValue) {
                        const newStyles = { ...component.styles, padding: `${newValue}${paddingUnit}` };
                        onUpdate({ ...component.props, styles: newStyles });
                      } else {
                        const newStyles = { ...component.styles, padding: undefined };
                        onUpdate({ ...component.props, styles: newStyles });
                      }
                    };

                    const handlePaddingUnitChange = (newUnit: string): void => {
                      const newStyles = { ...component.styles, padding: `${paddingValue}${newUnit}` };
                      onUpdate({ ...component.props, styles: newStyles });
                    };

                    return (
                      <>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={paddingValue}
                          onChange={(e) => handlePaddingValueChange(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                          placeholder="8"
                        />
                        <select
                          value={paddingUnit}
                          onChange={(e) => handlePaddingUnitChange(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="px">px</option>
                          <option value="rem">rem</option>
                          <option value="em">em</option>
                          <option value="%">%</option>
                        </select>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        );

      case 'Image':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Image URL
              </label>
              <input
                type="text"
                value={(component.props?.src as string) || ''}
                onChange={(e) => onUpdate({ ...component.props, src: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Alt Text
              </label>
              <input
                type="text"
                value={(component.props?.alt as string) || ''}
                onChange={(e) => onUpdate({ ...component.props, alt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Image description"
              />
            </div>
          </div>
        );

      case 'Video':
        return (
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Video URL
            </label>
            <input
              type="text"
              value={(component.props?.src as string) || ''}
              onChange={(e) => onUpdate({ ...component.props, src: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="https://example.com/video.mp4"
            />
          </div>
        );

      case 'ProductsList':
      case 'OffersList':
        return (
          <div className="text-sm text-gray-500 py-4 text-center border border-gray-200 rounded-lg">
            This component will automatically fetch and display data.
            <br />
            <span className="text-xs text-gray-400">No configuration needed</span>
          </div>
        );

      case 'Container':
        return (
          <div className="text-sm text-gray-500 py-4 text-center border border-gray-200 rounded-lg">
            Container for grouping components.
            <br />
            <span className="text-xs text-gray-400">Add child components in code</span>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500 py-4 text-center border border-gray-200 rounded-lg">
            No editor available for {component.type}
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Component Settings</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {component.type}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
          title="Remove component"
        >
          🗑️ Remove
        </button>
      </div>

      {/* Properties Editor */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Properties</h4>
        {renderPropsEditor()}
      </div>

      {/* Component ID */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-400 font-mono">
          ID: {component.id}
        </div>
      </div>
    </div>
  );
}

