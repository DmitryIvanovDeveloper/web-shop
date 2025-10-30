import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/showcase/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://localhost:* https://*.vercel.app",
          },
        ],
      },
    ];
  },
  /* config options here */
};


export default nextConfig;
