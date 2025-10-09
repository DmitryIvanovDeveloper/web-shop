"use client";
import "./globals.css";
import "./output.css";
import Sidebar from "@/shared/ui/Sidebar";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({ children }: { children: React.ReactNode}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSelect = (key: string) => {
    if (key === "dashboard") {
      router.push('/dashboard');
    } else if (key === "home") {
      router.push('/');
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
