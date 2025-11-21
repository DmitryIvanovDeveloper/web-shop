'use client';

import React from 'react';
import { ColorInput } from './ColorInput';

export interface TextEditorProps {
  // Content
  text: string;
  onTextChange: (value: string) => void;
  
  // Colors
  textColor: string;
  onTextColorChange: (value: string) => void;
  
  // Typography
  fontSize?: string;
  onFontSizeChange?: (value: string) => void;
  
  fontWeight?: string;
  onFontWeightChange?: (value: string) => void;
  
  textAlign?: string;
  onTextAlignChange?: (value: string) => void;
  
  textDecoration?: string;
  onTextDecorationChange?: (value: string) => void;
}

const fontSizeOptions = [
  { value: 'xs', label: 'XS (12px)' },
  { value: 'sm', label: 'SM (14px)' },
  { value: 'base', label: 'Base (16px)' },
  { value: 'lg', label: 'LG (18px)' },
  { value: 'xl', label: 'XL (20px)' },
  { value: '2xl', label: '2XL (24px)' },
  { value: '3xl', label: '3XL (30px)' },
  { value: '4xl', label: '4XL (36px)' },
];

const fontWeightOptions = [
  { value: 'normal', label: 'Normal (400)' },
  { value: 'medium', label: 'Medium (500)' },
  { value: 'semibold', label: 'Semibold (600)' },
  { value: 'bold', label: 'Bold (700)' },
  { value: 'extrabold', label: 'Extrabold (800)' },
];

const textAlignOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const textDecorationOptions = [
  { value: 'none', label: 'None' },
  { value: 'underline', label: 'Underline' },
  { value: 'line-through', label: 'Line Through' },
];

export function TextEditor({
  text,
  onTextChange,
  textColor,
  onTextColorChange,
  fontSize,
  onFontSizeChange,
  fontWeight,
  onFontWeightChange,
  textAlign,
  onTextAlignChange,
  textDecoration,
  onTextDecorationChange,
}: TextEditorProps): JSX.Element {
  return (
    <div className="space-y-4">
      {/* Text Content */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Content</h4>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Text Content
          </label>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            rows={4}
            placeholder="Enter text here..."
          />
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Colors</h4>
        <div className="space-y-3">
          <ColorInput
            label="textColor"
            value={textColor}
            onChange={onTextColorChange}
          />
        </div>
      </div>

      {/* Typography */}
      {(onFontSizeChange || onFontWeightChange || onTextAlignChange || onTextDecorationChange) && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Typography</h4>
          <div className="space-y-3">
            {onFontSizeChange && (
              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-1.5">
                  Font Size
                </label>
                <select
                  value={fontSize || 'base'}
                  onChange={(e) => onFontSizeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {fontSizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {onFontWeightChange && (
              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-1.5">
                  Font Weight
                </label>
                <select
                  value={fontWeight || 'normal'}
                  onChange={(e) => onFontWeightChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {fontWeightOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {onTextAlignChange && (
              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-1.5">
                  Text Align
                </label>
                <select
                  value={textAlign || 'left'}
                  onChange={(e) => onTextAlignChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {textAlignOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {onTextDecorationChange && (
              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-1.5">
                  Text Decoration
                </label>
                <select
                  value={textDecoration || 'none'}
                  onChange={(e) => onTextDecorationChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {textDecorationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

