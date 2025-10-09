import React from 'react';

interface ShortcutItem {
  key: string;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: { key: string; description: string }[];
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose, shortcuts }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800" aria-label="Close">×</button>
        </div>
        <div className="p-6">
          <ul className="space-y-2">
            {shortcuts.map((s, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="text-gray-700">{s.description}</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm">{s.key}</kbd>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;


