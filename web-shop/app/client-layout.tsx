'use client';

import { useRouter } from "next/navigation";
import Sidebar from "@/shared/ui/Sidebar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const routes: Record<string, string> = {
    home: '/',
    'analytics-dashboard': '/merchant-admin/analytics/dashboard',
    'merchant-admin-daily-rewards': '/merchant-admin/daily-rewards?appId=APP123',
    'merchant-admin-offers': '/merchant-admin/offers?appId=APP123',
    'merchant-admin-products': '/products?appId=APP123',
    'merchant-admin-patch-notes': '/merchant-admin/patch-notes?appId=APP123',
    'merchant-admin-localization': '/merchant-admin/localization',
    'ui-builder': '/ui-builder?appId=APP123&pageSlug=store',
  };

  const handleSelect = (key: string) => {
    const target = routes[key];
    if (target) {
      router.push(target);
    }
  };

  return (
    <div className="h-screen flex">
      <Sidebar onSelect={handleSelect} />
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white overflow-y-auto" style={{ marginLeft: 256 }}>
        {children}
      </main>
    </div>
  );
}
