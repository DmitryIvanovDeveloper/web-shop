"use client";
import 'reflect-metadata';
import '../src/env';
import '../src/infrastructure/bootstrap/container';
import '../src/modules/merchant-admin/analytics/realtime-dashboard/infrastructure/bootstrap/realtime-dashboard.container';
import '../src/modules/merchant-admin/offers/infrastructure/bootstrap/offers.container';
import '../src/modules/merchant-admin/products/infrastructure/bootstrap/products.container';
import "./globals.css";
import "./output.css";
import Sidebar from "@/shared/ui/Sidebar";
import { useRouter } from "next/navigation";
// import { usePathname } from "next/navigation";
// import { useEffect } from "react";

export default function RootLayout({ children }: { children: React.ReactNode}) {
  const router = useRouter();
  const routes: Record<string, string> = {
    home: '/',
    'analytics-dashboard': '/dashboard',
    'merchant-admin-offers': '/merchant-admin/offers',
    'merchant-admin-products': '/products',
  };

  const handleSelect = (key: string) => {
    const target = routes[key];
    if (target) {
      router.push(target);
    }
  };

  return (
    <html lang="en">
      <head>
        <title>Web Shop</title>
        <meta name="description" content="Web Shop Application" />
      </head>
      <body className="m-0 p-0 overflow-hidden">
        <div className="h-screen flex">
          <Sidebar onSelect={handleSelect} />
          <main className="flex-1 bg-gradient-to-b from-gray-50 to-white overflow-y-auto" style={{ marginLeft: 256 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
