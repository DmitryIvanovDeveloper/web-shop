import { useCallback, useMemo, useRef, useState } from 'react';

export interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<{ id: string; title: string; description?: string; type?: 'info' | 'success' | 'error' }[]>([]);
  const timeouts = useRef<Record<string, any>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timeouts.current[id]) {
      clearTimeout(timeouts.current[id]);
      delete timeouts.current[id];
    }
  }, []);

  const add = useCallback((type: 'info' | 'success' | 'error', opts: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, title: opts.title, description: opts.description, type }]);
    const duration = opts.duration ?? 3000;
    timeouts.current[id] = setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const api = useMemo(() => ({
    info: (opts: ToastOptions) => add('info', opts),
    success: (opts: ToastOptions) => add('success', opts),
    error: (opts: ToastOptions) => add('error', opts),
  }), [add]);

  return { toasts, toast: api, removeToast };
}

export default useToast;


