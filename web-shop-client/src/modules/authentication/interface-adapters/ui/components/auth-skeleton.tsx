'use client';

/**
 * Skeleton компонент для отображения во время загрузки авторизации
 */
export function AuthSkeleton(): JSX.Element {
	return (
		<div className="w-full p-4 space-y-3 animate-pulse">
			<div className="h-4 bg-gray-700 rounded w-3/4"></div>
			<div className="h-4 bg-gray-700 rounded w-1/2"></div>
		</div>
	);
}
