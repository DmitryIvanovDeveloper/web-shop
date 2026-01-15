export function AuthSkeleton() {
	return (
		<div className="w-full p-4 space-y-3">
			{/* Skeleton для аватара/иконки */}
			<div className="flex items-center gap-3">
				<div 
					className="w-10 h-10 bg-gray-600 rounded-full animate-pulse" 
					style={{ 
						flexShrink: 0, 
						minWidth: '2.5rem', 
						minHeight: '2.5rem',
						backgroundColor: '#4B5563' // gray-600
					}}
				/>
				<div className="flex-1 space-y-2 min-w-0">
					{/* Skeleton для имени пользователя */}
					<div 
						className="h-4 bg-gray-600 rounded animate-pulse w-3/4" 
						style={{ backgroundColor: '#4B5563' }} // gray-600
					/>
					{/* Skeleton для userId */}
					<div 
						className="h-3 bg-gray-700 rounded animate-pulse w-1/2" 
						style={{ backgroundColor: '#374151' }} // gray-700
					/>
				</div>
			</div>
		</div>
	);
}

