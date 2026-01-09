'use client';

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/shared/ui/Sidebar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // Get appId from URL search params instead of useSelectedProject
  const appId = searchParams?.get('appId');

  const routes: Record<string, string> = useMemo(() => ({
    home: '/',
    'analytics-dashboard': '/merchant-admin/analytics/dashboard',
    'merchant-admin-daily-rewards': appId ? `/merchant-admin/daily-rewards?appId=${appId}` : '/merchant-admin/daily-rewards',
    'merchant-admin-offers': appId ? `/merchant-admin/offers?appId=${appId}` : '/merchant-admin/offers',
    'merchant-admin-products': appId ? `/products?appId=${appId}` : '/products',
    'merchant-admin-patch-notes': appId ? `/merchant-admin/patch-notes?appId=${appId}` : '/merchant-admin/patch-notes',
    'merchant-admin-localization': '/merchant-admin/localization',
    'ui-builder': appId ? `/ui-builder?appId=${appId}&pageSlug=store` : '/ui-builder?pageSlug=store',
  }), [appId]);

  // Individual pages handle appId validation and redirect to projects if needed

  const handleSelect = (key: string) => {
    const target = routes[key];
    if (target) {
      setIsNavigating(true);
      router.push(target);
    }
  };

  // Reset navigation state when route changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  return (
    <div className="h-screen flex">
      {/* Navigation Loading Bar */}
      {isNavigating && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: '#3B82F6',
            zIndex: 1000,
            animation: 'loading-bar 0.3s ease-out'
          }}
        />
      )}

      <Sidebar onSelect={handleSelect} />
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white overflow-y-auto" style={{ marginLeft: 256 }}>
        {children}
      </main>
    </div>
  );
}
