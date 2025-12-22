'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PatchNotesAdminPage() {
  const searchParams = useSearchParams();
  const appId = searchParams.get('appId') || 'default-app';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patch Notes Management</h1>
        <p className="text-gray-600 mt-1">Manage patch notes and updates for your application</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current App ID: {appId}</h2>
        </div>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-900 mb-2">Create New Patch Note</h3>
            <p className="text-gray-600 text-sm">Feature coming soon...</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-900 mb-2">Manage Existing Patch Notes</h3>
            <p className="text-gray-600 text-sm">Feature coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
