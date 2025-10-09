import React from 'react';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: 'info' | 'success' | 'error';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className={`min-w-[240px] max-w-sm px-4 py-3 rounded-lg shadow-lg border text-sm ${
          t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold">{t.title}</div>
              {t.description && <div className="text-xs mt-0.5 opacity-80">{t.description}</div>}
            </div>
            <button onClick={() => onClose(t.id)} className="text-gray-500 hover:text-gray-800" aria-label="Close">×</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;


