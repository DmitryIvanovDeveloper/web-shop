'use client';

export function LoadingState() {
  return (
    <div className="text-white text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
      <p>Loading products...</p>
    </div>
  );
}
