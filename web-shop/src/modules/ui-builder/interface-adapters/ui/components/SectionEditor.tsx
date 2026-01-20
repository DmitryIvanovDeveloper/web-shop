'use client';

import React from 'react';
import type { PageSection, SectionLayout } from '../../../domain/entities/page-section.entity';

interface SectionEditorProps {
  section: PageSection;
  onUpdateLayout: (layout: SectionLayout) => void;
  onUpdateStyles: (styles: Record<string, unknown>) => void;
  onRemove: () => void;
}

export function SectionEditor({
  section,
  onUpdateLayout,
  onUpdateStyles,
  onRemove,
}: SectionEditorProps): JSX.Element {
  const handleLayoutChange = (partial: Partial<SectionLayout>) => {
    onUpdateLayout({ ...section.layout, ...partial });
  };

  const handleBackgroundColorChange = (value: string) => {
    onUpdateStyles({ ...section.styles, backgroundColor: value });
  };

  const handleGapChange = (value: string) => {
    onUpdateLayout({ ...section.layout, gap: value });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Section Settings</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
          title="Remove section"
        >
          🗑️ Remove
        </button>
      </div>

      <div className="space-y-4">
        {/* Layout */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Layout</h4>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Grid Columns
            </label>
            <select
              value={section.layout.grid}
              onChange={(e) => handleLayoutChange({ grid: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="1-column">1 Column</option>
              <option value="2-column">2 Columns</option>
              <option value="3-column">3 Columns</option>
              <option value="4-column">4 Columns</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Gap Between Items
            </label>
            <input
              type="text"
              value={section.layout.gap || '1rem'}
              onChange={(e) => handleGapChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="e.g. 1rem"
            />
          </div>
        </div>

        {/* Background */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Background
          </h4>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={(section.styles?.backgroundColor as string) || '#111827'}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={(section.styles?.backgroundColor as string) || ''}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                placeholder="#111827"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

