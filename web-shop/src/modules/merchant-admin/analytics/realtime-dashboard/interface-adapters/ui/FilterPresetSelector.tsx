import React from 'react';
import { FilterPreset } from '../../domain/entities/filter-preset.entity';

interface FilterPresetSelectorProps {
  presets: FilterPreset[];
  currentPresetId?: string;
  onLoad: (presetId: string) => void;
  onSave: (name: string) => void;
  isLoading?: boolean;
}

export const FilterPresetSelector: React.FC<FilterPresetSelectorProps> = ({
  presets,
  currentPresetId,
  onLoad,
  onSave,
  isLoading = false,
}) => {
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [newPresetName, setNewPresetName] = React.useState('');

  const handleSave = (): void => {
    if (newPresetName.trim()) {
      onSave(newPresetName.trim());
      setNewPresetName('');
      setShowSaveDialog(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="mr-2">⭐</span>
            Saved Presets
          </label>
          <select
            value={currentPresetId || ''}
            onChange={(e) => e.target.value && onLoad(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select a preset...</option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setShowSaveDialog(true)}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            💾 Save Current
          </button>
        </div>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Save Filter Preset</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Preset Name</label>
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="e.g., Monthly US Sales"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                maxLength={100}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewPresetName('');
                }}
                className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!newPresetName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

