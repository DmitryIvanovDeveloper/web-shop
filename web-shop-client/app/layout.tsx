"use client";
import 'reflect-metadata';
import '../src/infrastructure/bootstrap/container';
import "./output.css";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({ children }: { children: React.ReactNode}) {
  const router = useRouter();
  const pathname = usePathname();


  return (
    <html lang="en">
      <head>
        <title>Web Shop</title>
        <meta name="description" content="Web Shop Application" />
      </head>
      <body className="m-0 p-0 overflow-hidden">
        <div className="h-screen flex">
          <main className="flex-1 bg-gradient-to-b from-gray-50 to-white overflow-y-auto" >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
