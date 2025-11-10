'use client';

import React, { useState } from 'react';

interface BackgroundSettings {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundAttachment?: string;
}

interface BackgroundEditorProps {
  value: BackgroundSettings | undefined;
  onChange: (changes: BackgroundSettings) => void;
}

export function BackgroundEditor({ value, onChange }: BackgroundEditorProps): JSX.Element {
  const [isUploading, setIsUploading] = useState(false);

  const background = value ?? {};

  const updateField = (field: keyof BackgroundSettings, fieldValue: string): void => {
    onChange({
      ...background,
      [field]: fieldValue,
    });
  };

  const clearField = (field: keyof BackgroundSettings): void => {
    const next = { ...background };
    delete next[field];
    onChange(next);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      const base64: string = await new Promise((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      onChange({
        ...background,
        backgroundImage: `url("${base64}")`,
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3 pb-3 border-b border-gray-200">
        Application Background
      </h3>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600 block">Background Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={background.backgroundColor || '#12141A'}
              onChange={(e) => updateField('backgroundColor', e.target.value)}
              className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={background.backgroundColor || ''}
              onChange={(e) => updateField('backgroundColor', e.target.value)}
              placeholder="#12141A"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {background.backgroundColor && (
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-800"
                onClick={() => clearField('backgroundColor')}
                title="Reset color"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600 block">Background Image / Gradient</label>
          <div className="flex gap-2 items-start">
            <textarea
              rows={2}
              value={background.backgroundImage || ''}
              onChange={(e) => updateField('backgroundImage', e.target.value)}
              placeholder='url("https://example.com/bg.png") or linear-gradient(...)'
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
            />
            {background.backgroundImage && (
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-800 mt-1"
                onClick={() => clearField('backgroundImage')}
                title="Remove"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-500">
            Accepts any valid CSS value: <code className="font-mono">url("...")</code>, <code className="font-mono">linear-gradient(...)</code>, multiple layers, etc. Use the uploader below for base64 images.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 transition"
              onClick={() => updateField('backgroundImage', 'linear-gradient(182.46deg, #FA5255 1.76%, #E68057 97.7%)')}
            >
              Apply peach gradient
            </button>
            <button
              type="button"
              className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 transition"
              onClick={() => updateField('backgroundImage', 'linear-gradient(135deg, #4F46E5 0%, #9333EA 50%, #DB2777 100%)')}
            >
              Apply violet gradient
            </button>
            <button
              type="button"
              className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 transition"
              onClick={() => updateField('backgroundImage', 'linear-gradient(120deg, #0EA5E9 0%, #22C55E 50%, #F4F4F5 100%)')}
            >
              Apply aqua gradient
            </button>
          </div>
          <label className={`inline-flex mt-1 px-3 py-2 border border-gray-300 rounded text-xs ${isUploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={handleFileUpload}
            />
            {isUploading ? '📤 Uploading…' : '📤 Upload Image'}
          </label>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-3 items-center">
          <label className="text-xs font-medium text-gray-600">Background Size</label>
          <input
            type="text"
            value={background.backgroundSize || ''}
            onChange={(e) => updateField('backgroundSize', e.target.value)}
            placeholder="cover | contain | 100% 100%"
            className="px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-3 items-center">
          <label className="text-xs font-medium text-gray-600">Background Position</label>
          <input
            type="text"
            value={background.backgroundPosition || ''}
            onChange={(e) => updateField('backgroundPosition', e.target.value)}
            placeholder="center | top | left top"
            className="px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-3 items-center">
          <label className="text-xs font-medium text-gray-600">Background Repeat</label>
          <select
            value={background.backgroundRepeat || ''}
            onChange={(e) => updateField('backgroundRepeat', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Default</option>
            <option value="no-repeat">no-repeat</option>
            <option value="repeat">repeat</option>
            <option value="repeat-x">repeat-x</option>
            <option value="repeat-y">repeat-y</option>
            <option value="space">space</option>
            <option value="round">round</option>
          </select>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-3 items-center">
          <label className="text-xs font-medium text-gray-600">Background Attachment</label>
          <select
            value={background.backgroundAttachment || ''}
            onChange={(e) => updateField('backgroundAttachment', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Default</option>
            <option value="scroll">scroll</option>
            <option value="fixed">fixed</option>
            <option value="local">local</option>
          </select>
        </div>

        {background.backgroundImage && (
          <div className="pt-2">
            <p className="text-xs font-medium text-gray-600 mb-1">Preview</p>
            <div
              className="border border-gray-200 rounded-lg overflow-hidden h-24"
              style={{
                backgroundColor: background.backgroundColor,
                backgroundImage: background.backgroundImage,
                backgroundSize: background.backgroundSize,
                backgroundPosition: background.backgroundPosition,
                backgroundRepeat: background.backgroundRepeat,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}



