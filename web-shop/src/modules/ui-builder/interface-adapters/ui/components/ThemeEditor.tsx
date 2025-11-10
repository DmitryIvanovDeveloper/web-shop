'use client';

import React, { useState } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  error: string;
  warning: string;
  border: string;
}

interface ThemeEditorProps {
  colors: ThemeColors;
  onChange: (colors: ThemeColors) => void;
}

export function ThemeEditor({ colors, onChange }: ThemeEditorProps): JSX.Element {
  const [editedColors, setEditedColors] = useState<ThemeColors>(colors);

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    const newColors = {
      ...editedColors,
      [key]: value,
    };
    setEditedColors(newColors);
    onChange(newColors);
  };

  const colorEntries = Object.entries(editedColors) as [keyof ThemeColors, string][];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3 pb-3 border-b border-gray-200">Theme Colors</h3>
      
      <div className="space-y-2">
        {colorEntries.map(([key, value]) => (
          <div key={key} className="grid grid-cols-[140px_1fr] gap-3 items-center">
            <label className="text-sm font-medium text-gray-700 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={value}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="w-10 h-8 rounded border border-gray-300 cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="#000000"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}















