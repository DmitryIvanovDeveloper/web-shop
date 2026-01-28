import React from 'react';

interface SiteRendererProps {
  appId: string;
}

export function SiteRenderer({ appId }: SiteRendererProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Site Renderer</h2>
        <p className="text-gray-600">App ID: {appId}</p>
        <p className="text-sm text-gray-500 mt-2">SiteRenderer component placeholder</p>
      </div>
    </div>
  );
}