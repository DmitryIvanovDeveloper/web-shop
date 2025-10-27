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
import { DynamicRenderer } from '../src/modules/ui-renderer/interface-adapters/ui/components/dynamic-renderer';
import { LoadPageConfigUseCase } from '../src/modules/ui-renderer/application/use-cases/load-page-config.use-case';
import type { ActionContext } from '../src/modules/ui-renderer/domain/types';

export default function RootLayout({ children }: { children: React.ReactNode}) {
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [rightSidebarConfig, setRightSidebarConfig] = useState<any>(null);

  const sidebarPresenter = container.get<SidebarRendererPresenter>(
    UI_RENDERER_TYPES.SidebarRendererPresenter
  );

  const loadConfigUseCase = container.get<LoadPageConfigUseCase>(
    UI_RENDERER_TYPES.LoadPageConfigUseCase
  );

  const actionContext: ActionContext = {
    onPopupOpen: () => {},
    onPopupClose: () => {},
  };

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const rightResult = await loadConfigUseCase.execute({ pageType: 'right-sidebar' });
        if (rightResult.isSuccess()) {
          setRightSidebarConfig(rightResult.data);
        } else {
          console.error('Failed to load right sidebar config:', rightResult.error);
        }
      } catch (err) {
        console.error('Failed to load right sidebar config:', err);
      }
    };
    loadConfigs();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024); // Скрываем sidebar на tablet тоже (как у Pixel Gun)
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
      </head>
      <body className="m-0 p-0 overflow-hidden">
        {/* Hidden AuthModule for background authentication - всегда активен */}
        <div style={{ display: 'none' }}>
          <AuthModule renderSidebarButton={false} renderPopupConfig={false} />
        </div>

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
            {/* Left Sidebar - только на desktop, компактный для больше места Grid */}
            {!isMobile && (
              <aside className="w-64 border-r border-gray-700 bg-gray-900 flex-shrink-0" style={{ borderLeft: '2px solid rgba(251, 191, 36, 0.3)' }}>
                <SidebarRenderer presenter={sidebarPresenter} actionContext={actionContext} />
              </aside>
            )}

            {/* Main Content */}
            {children}

            {/* Right Sidebar - только на desktop, компактный для больше места Grid */}
            {!isMobile && (
              <aside className="w-64 border-l border-yellow-400/30 flex-shrink-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(2px)', borderLeft: '0.5px solid rgba(156, 163, 175, 0.5)' }}>
                <div className="p-4">
                  <div className="mb-4">
                    <AuthModule renderSidebarButton={true} renderPopupConfig={true} />
                  </div>
                  
                  {rightSidebarConfig && rightSidebarConfig.layout?.children?.length > 0 && (
                    <DynamicRenderer 
                      node={rightSidebarConfig.layout} 
                      theme={rightSidebarConfig.theme}
                      actionContext={actionContext}
                    />
                  )}
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
                
                {rightSidebarConfig && rightSidebarConfig.layout?.children?.length > 0 && (
                  <DynamicRenderer 
                    node={rightSidebarConfig.layout} 
                    theme={rightSidebarConfig.theme}
                    actionContext={actionContext}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </body>
    </html>
  );
}