'use client';

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/shared/ui/Sidebar";
import { useSelectedProject } from "@/shared/hooks/useSelectedProject";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  const appIdFromUrl = searchParams?.get('appId');
  const merchantIdFromUrl = searchParams?.get('merchantId');

  const { selectedProject } = useSelectedProject();

  const appId = appIdFromUrl || selectedProject?.appId || null;
  const merchantId = merchantIdFromUrl || selectedProject?.merchantId || null;

  const routes: Record<string, string> = useMemo(() => {
    const buildQuery = (includeAppId: boolean = true, includeMerchantId: boolean = true) => {
      const params = new URLSearchParams();
      if (includeAppId && appId) {
        params.set('appId', appId);
      }
      if (includeMerchantId && merchantId) {
        params.set('merchantId', merchantId);
      }
      const queryString = params.toString();
      return queryString ? `?${queryString}` : '';
    };

    return {
      home: '/',
      'analytics-dashboard': `/merchant-admin/analytics/dashboard${buildQuery()}`,
      'merchant-admin-daily-rewards': `/merchant-admin/daily-rewards${buildQuery()}`,
      'merchant-admin-offers': `/merchant-admin/offers${buildQuery()}`,
      'merchant-admin-products': `/products${buildQuery()}`,
      'merchant-admin-promo-codes': `/merchant-admin/promo-codes${buildQuery()}`,
      'merchant-admin-patch-notes': `/merchant-admin/patch-notes${buildQuery()}`,
      'merchant-admin-localization': `/merchant-admin/localization${buildQuery(false, true)}`,
      'ui-builder': (() => {
        const query = buildQuery();
        const separator = query ? '&' : '?';
        return `/ui-builder${query}${separator}pageSlug=store`;
      })(),
      'app-builder': `/app-builder${buildQuery()}`,
    };
  }, [appId, merchantId]);

  const handleSelect = (key: string) => {
    const target = routes[key];
    if (target) {
      setIsNavigating(true);
      router.push(target);
    }
  };

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  return (
    <div className="h-screen flex">
      {}
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
