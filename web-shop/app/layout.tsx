import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Shop",
  description: "AI-powered web shop with intelligent agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
