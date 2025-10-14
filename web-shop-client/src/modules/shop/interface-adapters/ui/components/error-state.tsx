'use client';

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="text-red-400 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <p className="text-lg font-medium mb-2">Ошибка загрузки</p>
      <p className="text-sm">{error}</p>
    </div>
  );
}
