'use client';

import React from 'react';
import { LocalizationDashboard } from '../../../src/modules/localization/interface-adapters/ui/views/LocalizationDashboard';

interface PageProps {
  searchParams: Promise<{
    appId?: string;
  }>;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.15), rgba(15, 23, 42, 0.95) 45%), #0F172A',
  color: '#F8FAFC',
  padding: '32px',
  boxSizing: 'border-box',
  overflow: 'hidden',
};

export default async function LocalizationPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const appId = params.appId;

  if (!appId) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
            App ID Required
          </h1>
          <p style={{ color: '#6B7280' }}>
            Please specify ?appId=YOUR_APP_ID in the URL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.2px' }}>
          Localization Management
        </h1>
        <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '14px' }}>
          Configure languages, translations and regional settings for your application
        </p>
      </header>

      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        <LocalizationDashboard />
      </div>
    </div>
  );
}
