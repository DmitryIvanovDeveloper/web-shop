'use client';

import { useState } from 'react';
import Avatar from 'react-avatar';
import type { AppUser } from '../../../domain/types';

interface UserInfoProps {
	renderSidebarButton: boolean;
	currentUser: AppUser | null;
}

export function UserInfo({ renderSidebarButton, currentUser }: UserInfoProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	if (!renderSidebarButton || !currentUser) {
		return null;
	}

	return (
		<div className="relative w-full p-4" style={{ display: 'block' }}>
			{/* Основной контейнер с информацией о пользователе - строго вертикально */}
			<div 
				className="flex flex-col items-center space-y-3"
				style={{ 
					display: 'flex', 
					flexDirection: 'column',
					alignItems: 'center',
					width: '100%'
				}}
			>
				{/* Аватар с использованием библиотеки */}
				<div className="relative" style={{ display: 'block' }}>
					<Avatar
						name={currentUser.username}
						size="64"
						round={true}
						className="mx-auto"
					/>

					{/* Кнопка меню */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="absolute bottom-0 right-0 w-6 h-6 rounded bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-colors"
						aria-label="Menu"
					>
						<div className="flex flex-col space-y-0.5">
							<div className="w-2.5 h-0.5 bg-white rounded"></div>
							<div className="w-2.5 h-0.5 bg-white rounded"></div>
							<div className="w-2.5 h-0.5 bg-white rounded"></div>
						</div>
					</button>
				</div>

				{/* Имя пользователя - строго под аватаром */}
				<div 
					className="text-center text-white"
					style={{
						display: 'block',
						width: '100%',
						textAlign: 'center'
					}}
				>
					{currentUser.username}
				</div>
			</div>

			{/* Выпадающее меню */}
			{isMenuOpen && (
				<div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-lg z-50">
					<div className="p-2 space-y-1">
						<button
							onClick={() => {
								// TODO: Реализовать логику выхода
								console.log('Logout clicked');
								setIsMenuOpen(false);
							}}
							className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded transition-colors"
						>
							Выйти
						</button>
						<button
							onClick={() => {
								// TODO: Реализовать логику настроек
								console.log('Settings clicked');
								setIsMenuOpen(false);
							}}
							className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded transition-colors"
						>
							Настройки
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

