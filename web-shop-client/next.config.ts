import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/showcase/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Allow embedding from local hosts used by sibling apps
            value: "frame-ancestors 'self' http://localhost:3000 http://localhost:3001;",
          },
        ],
      },
    ];
  },
  
};


export default nextConfig;
