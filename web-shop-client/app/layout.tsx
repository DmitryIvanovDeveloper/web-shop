"use client";
import '../src/env'; // Load environment variables first
import 'reflect-metadata';
import { container } from '../src/infrastructure/bootstrap/container';
import "./output.css";
import { AuthModule } from '../src/modules/authentication/interface-adapters/ui/auth-module';
import { useState, useEffect } from 'react';
import { UI_RENDERER_TYPES } from '../src/modules/ui-renderer/infrastructure/bootstrap/types';
import { SidebarRendererPresenter } from '../src/modules/ui-renderer/interface-adapters/presenters/sidebar-renderer.presenter';
import { SidebarRenderer } from '../src/modules/ui-renderer/interface-adapters/ui/components/sidebar-renderer';
import type { ActionContext } from '../src/modules/ui-renderer/domain/types';
import { LoadAppConfigUseCase } from '../src/application/use-cases/load-app-config.use-case';
import { TYPES } from '../src/infrastructure/bootstrap/types';

export default function RootLayout({ children }: { children: React.ReactNode}) {
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  const sidebarPresenter = container.get<SidebarRendererPresenter>(
    UI_RENDERER_TYPES.SidebarRendererPresenter
  );

  const actionContext: ActionContext = {
    onPopupOpen: () => {},
    onPopupClose: () => {},
  };

  // Load app-config.json при старте приложения (один раз)
  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        setIsConfigLoading(true);
        const loadAppConfigUseCase = container.get<LoadAppConfigUseCase>(TYPES.LoadAppConfig);
        await loadAppConfigUseCase.execute();
        console.log('[RootLayout] App config loaded and distributed via EventBus');
        // Даём время на обработку события и рендер компонентов
        setTimeout(() => setIsConfigLoading(false), 300);
      } catch (err) {
        console.error('[RootLayout] Failed to load app config:', err);
        setIsConfigLoading(false);
      }
    };
    loadAppConfig();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024); // Скрываем sidebar на 1024px включительно (как у Pixel Gun)
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Web Shop</title>
        <meta name="description" content="Web Shop Application" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </head>
      <body className="m-0 p-0 overflow-hidden">
        <>
            {/* Global Loader - показывается пока загружается app-config.json */}
            {isConfigLoading && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#0D1117',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            {/* Spinner */}
            <div 
              style={{
                width: '64px',
                height: '64px',
                border: '4px solid rgba(251, 191, 36, 0.2)',
                borderTop: '4px solid #FBBF24',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
            {/* Loading Text */}
            <p 
              style={{
                marginTop: '24px',
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Loading...
            </p>
          </div>
          )}

            {/* AuthModule - управляет авторизацией и рендерит popup */}
            <AuthModule renderSidebarButton={false} renderPopupConfig={true} />

            {/* Mobile Header - показывается только на мобилке */}
            {isMobile && (
              <header className="px-4 flex items-center justify-between relative" style={{ height: '56px', minHeight: '56px', zIndex: 100, backgroundColor: '#2c3e50' }}>
                <button 
                  className="p-2 hover:bg-[#34495e] rounded transition-colors bg-[#34495e]" 
                  aria-label="Menu"
                  onClick={() => setIsLeftDrawerOpen(true)}
                  style={{ minWidth: '40px', minHeight: '40px' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="#ffffff" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <span className="text-white font-semibold text-lg">Web Shop</span>
                <button 
                  className="p-2 hover:bg-[#34495e] rounded transition-colors bg-[#34495e]" 
                  aria-label="Profile"
                  onClick={() => setIsRightDrawerOpen(true)}
                  style={{ minWidth: '40px', minHeight: '40px' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="#ffffff" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              </header>
            )}
        
            <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex relative h-screen md:h-screen" style={{ height: isMobile ? 'calc(100vh - 56px)' : '100vh' }}>
              {/* Left Sidebar - скрывается на экранах < 1280px (xl breakpoint) */}
              {!isMobile && (
                <aside data-element-id="left-sidebar" className="hidden xl:block w-64 border-r border-gray-700 bg-gray-900 flex-shrink-0" style={{ borderLeft: '2px solid rgba(251, 191, 36, 0.3)' }}>
                  <SidebarRenderer presenter={sidebarPresenter} actionContext={actionContext} />
                </aside>
              )}

              {/* Main Content - занимает всю ширину на < xl, иначе между sidebar'ами */}
              <main className="flex-1 overflow-y-auto w-full">
                {children}
              </main>

              {/* Right Sidebar - скрывается на экранах < 1280px (xl breakpoint) */}
              {!isMobile && (
                <aside className="hidden xl:block w-64 border-l border-yellow-400/30 flex-shrink-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(2px)', borderLeft: '0.5px solid rgba(156, 163, 175, 0.5)' }}>
                  <div className="p-4">
                    <div className="mb-4">
                      <AuthModule renderSidebarButton={true} renderPopupConfig={true} />
                    </div>
                  
                    <SidebarRenderer 
                      presenter={sidebarPresenter} 
                      layoutType="rightSidebar"
                      actionContext={actionContext}
                    />
                  </div>
                </aside>
              )}
            </div>

            {/* Left Drawer Overlay */}
            {isLeftDrawerOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50"
                  style={{ zIndex: 9998 }}
                  onClick={() => setIsLeftDrawerOpen(false)}
                />
                <div className="fixed left-0 top-0 bottom-0 shadow-2xl animate-slide-in-left overflow-y-auto w-full" style={{ zIndex: 9999, width: '85%' }}>
                  <div className="w-full h-full">
                    <SidebarRenderer presenter={sidebarPresenter} actionContext={actionContext} />
                  </div>
                </div>
              </>
            )}

            {/* Right Drawer Overlay */}
            {isRightDrawerOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50"
                  style={{ zIndex: 9998 }}
                  onClick={() => setIsRightDrawerOpen(false)}
                />
                <div className="fixed right-0 top-0 bottom-0 shadow-2xl animate-slide-in-right overflow-y-auto border-l border-yellow-400/30" style={{ zIndex: 9999, backgroundColor: '#1f2937', borderLeft: '0.5px solid rgba(156, 163, 175, 0.5)', width: '85%' }}>
                  <div className="p-4">
                    <div className="mb-4">
                      <AuthModule renderSidebarButton={true} renderPopupConfig={true} />
                    </div>
                
                    <SidebarRenderer 
                      presenter={sidebarPresenter} 
                      layoutType="rightSidebar"
                      actionContext={actionContext}
                    />
                  </div>
                </div>
              </>
            )}
          </>
      </body>
    </html>
  );
}