import 'reflect-metadata';
import '../src/env';
import '../src/infrastructure/bootstrap/container';
import '../src/modules/merchant-admin/analytics/realtime-dashboard/infrastructure/bootstrap/realtime-dashboard.container';
import '../src/modules/merchant-admin/offers/infrastructure/bootstrap/offers.container';
import '../src/modules/merchant-admin/products/infrastructure/bootstrap/products.container';
import '../src/modules/merchant-admin/products/infrastructure/bootstrap/products.container';
import "./globals.css";
import "./output.css";

export default function RootLayout({ children }: { children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <title>Web Shop</title>
        <meta name="description" content="Web Shop Application" />
        <style>{`
          @keyframes loading-bar {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </head>
      <body className="m-0 p-0 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
