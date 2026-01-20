'use client';

import React from 'react';
import type { DeviceType, Orientation } from './PhoneMockup';

interface DeviceControlsProps {
  device: DeviceType;
  orientation: Orientation;
  onDeviceChange: (device: DeviceType) => void;
  onOrientationChange: (orientation: Orientation) => void;
  onFullscreen: () => void;
  onRefresh?: () => void;
  onOpenInNewTab?: () => void;
}

const deviceOptions: Array<{ value: DeviceType; label: string }> = [
  { value: 'iphone-15-pro', label: 'iPhone 15 Pro' },
  { value: 'iphone-14-pro', label: 'iPhone 14 Pro' },
  { value: 'iphone-se', label: 'iPhone SE' },
  { value: 'ipad', label: 'iPad' },
];

export function DeviceControls({
  device,
  orientation,
  onDeviceChange,
  onOrientationChange,
  onFullscreen,
  onRefresh,
  onOpenInNewTab,
}: DeviceControlsProps): JSX.Element {
  return (
    <div className="flex gap-2 items-center">
      {}
      <select
        value={device}
        onChange={(e) => onDeviceChange(e.target.value as DeviceType)}
        className="px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Select device"
      >
        {deviceOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {}
      <div className="flex gap-0.5 border border-gray-300 rounded p-0.5 bg-white">
        <button
          onClick={() => onOrientationChange('portrait')}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            orientation === 'portrait'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Portrait orientation"
        >
          <span className="inline-block transform rotate-0">📱</span>
        </button>
        <button
          onClick={() => onOrientationChange('landscape')}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            orientation === 'landscape'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Landscape orientation"
        >
          <span className="inline-block transform rotate-90">📱</span>
        </button>
      </div>

      {}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="p-1.5 text-gray-600 hover:text-gray-900 text-sm rounded hover:bg-gray-100 transition-colors"
          title="Refresh preview"
        >
          ↻
        </button>
      )}

      {}
      <button
        onClick={onFullscreen}
        className="p-1.5 text-gray-600 hover:text-gray-900 text-sm rounded hover:bg-gray-100 transition-colors"
        title="Fullscreen preview"
      >
        ⛶
      </button>

      {}
      {onOpenInNewTab && (
        <button
          onClick={onOpenInNewTab}
          className="p-1.5 text-gray-600 hover:text-gray-900 text-sm rounded hover:bg-gray-100 transition-colors"
          title="Open in new tab"
        >
          ↗
        </button>
      )}
    </div>
  );
}

