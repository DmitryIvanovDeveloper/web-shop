import type { AppUser } from '../../../domain/types';

interface UserInfoProps {
	renderSidebarButton: boolean;
	currentUser: AppUser | null;
}

export function UserInfo({ renderSidebarButton, currentUser }: UserInfoProps) {
	if (!renderSidebarButton || !currentUser) {
		return null;
	}

	return (
		<div className="p-4">
			<div className="flex items-center space-x-3">
				<div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
					<span className="text-white font-bold text-lg">
						{currentUser.username.charAt(0).toUpperCase()}
					</span>
				</div>
				<div>
					<h3 className="text-lg font-semibold text-white">
						{currentUser.username}
					</h3>
					<p className="text-sm text-gray-300">
						App ID: {currentUser.appId}
					</p>
					<p className="text-xs text-green-400 font-medium">
						✓ Authorized
					</p>
				</div>
			</div>
		</div>
	);
}

