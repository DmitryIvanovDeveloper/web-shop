'use client';

import React from 'react';
import type { PageSection, SectionLayout } from '../../../domain/entities/page-section.entity';

interface SectionEditorProps {
  section: PageSection;
  onUpdateLayout: (layout: SectionLayout) => void;
  onUpdateStyles: (styles: Record<string, unknown>) => void;
  onRemove: () => void;
}

export function SectionEditor({ section, onUpdateLayout, onUpdateStyles, onRemove }: SectionEditorProps): JSX.Element {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
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

      {/* Layout Settings */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Layout</h4>

        {/* Grid Layout */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Grid Columns
          </label>
          <select
            value={section.layout.grid}
            onChange={(e) => onUpdateLayout({ ...section.layout, grid: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="1-column">1 Column</option>
            <option value="2-column">2 Columns</option>
            <option value="3-column">3 Columns</option>
            <option value="4-column">4 Columns</option>
          </select>
        </div>

        {/* Gap */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Gap Between Items
          </label>
          <input
            type="text"
            value={section.layout.gap || '1rem'}
            onChange={(e) => onUpdateLayout({ ...section.layout, gap: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
            placeholder="1rem"
          />
          <p className="text-xs text-gray-400 mt-1">Examples: 1rem, 20px, 2em</p>
        </div>

        {/* Alignment */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Item Alignment
          </label>
          <select
            value={section.layout.align || 'start'}
            onChange={(e) => onUpdateLayout({ ...section.layout, align: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="start">Start (Top)</option>
            <option value="center">Center</option>
            <option value="end">End (Bottom)</option>
          </select>
        </div>
      </div>

      {/* Style Settings */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Styles</h4>

        {/* Background Color */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={(section.styles?.backgroundColor as string) || '#ffffff'}
              onChange={(e) => onUpdateStyles({ ...section.styles, backgroundColor: e.target.value })}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={(section.styles?.backgroundColor as string) || '#ffffff'}
              onChange={(e) => onUpdateStyles({ ...section.styles, backgroundColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#ffffff"
            />
          </div>
        </div>

        {/* Padding */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Padding
          </label>
          <input
            type="text"
            value={(section.styles?.padding as string) || '2rem'}
            onChange={(e) => onUpdateStyles({ ...section.styles, padding: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
            placeholder="2rem"
          />
          <p className="text-xs text-gray-400 mt-1">Examples: 2rem, 20px 40px, 1em 2em 1em 2em</p>
        </div>
      </div>

      {/* Component Count */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <span className="font-medium">{section.components.length}</span> component(s) in this section
        </div>
      </div>
    </div>
  );
}

