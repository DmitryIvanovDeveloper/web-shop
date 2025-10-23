"use client";
import '../src/env'; // Load environment variables first
import 'reflect-metadata';
import '../src/infrastructure/bootstrap/container';
import "./output.css";

export default function RootLayout({ children }: { children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <title>Web Shop</title>
        <meta name="description" content="Web Shop Application" />
      </head>
      <body className="m-0 p-0 overflow-hidden">
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex">
            {children}
        </div>
      </body>
    </html>
  );
}