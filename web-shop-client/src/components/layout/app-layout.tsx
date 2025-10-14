import { ReactNode } from 'react';
import Link from 'next/link';
import { AuthModule, AuthLoginButton } from '../../modules/authentication/interface-adapters/ui';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthModule>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-yellow-400/30 backdrop-blur-sm flex-shrink-0" style={{ backgroundColor: '#04183e' }}>
          {/* Header */}
          <div className="p-3 border-b border-yellow-400/30">
            <div className="flex justify-center">
              <div className="bg-yellow-400 p-2 rounded-lg">
                <div className="text-white font-bold text-lg" style={{ fontFamily: 'monospace' }}>
                  Web Shops X
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="block px-4 py-2 text-white hover:bg-yellow-400/20 rounded-lg transition-colors"
                >
                  🏠 Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/shop" 
                  className="block px-4 py-2 text-white hover:bg-yellow-400/20 rounded-lg transition-colors"
                >
                  🛒 Shop
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto relative">
          {/* Login Button - Top Right */}
          <div className="absolute top-4 right-4 z-10">
            <AuthLoginButton />
          </div>
          {children}
        </div>
      </div>
    </AuthModule>
  );
}
