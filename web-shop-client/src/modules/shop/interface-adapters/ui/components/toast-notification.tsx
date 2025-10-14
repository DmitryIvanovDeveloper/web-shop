'use client';

interface ToastNotificationProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function ToastNotification({ show, message, type = 'success' }: ToastNotificationProps) {
  if (!show) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  const icon = type === 'success' ? '✓' : 
               type === 'error' ? '✗' : 'ℹ️';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
