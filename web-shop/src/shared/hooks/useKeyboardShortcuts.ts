import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  handler: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      for (const sc of shortcuts) {
        const matchKey = sc.key.length === 1 ? e.key.toLowerCase() === sc.key.toLowerCase() : e.key === sc.key;
        const matchCtrl = sc.ctrl ? (e.ctrlKey || e.metaKey) : true;
        if (matchKey && matchCtrl) {
          e.preventDefault();
          sc.handler();
          return;
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shortcuts]);
}

export default useKeyboardShortcuts;

