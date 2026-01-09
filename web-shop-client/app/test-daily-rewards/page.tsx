
'use client';

// Test DailyRewards popup without app config dependency
import React, { useState, useEffect } from 'react';
import { useAppId } from '../../src/shared/hooks/use-app-context';

export default function TestDailyRewardsPage() {
  const [showPopup, setShowPopup] = useState(false);
  const appId = useAppId();

  useEffect(() => {
    console.log('[TestPage] appId:', appId);
    if (appId) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        console.log('Test popup should be visible now');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [appId]);

  if (!appId) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Test DailyRewards Popup</h1>
        <p>Loading app context...</p>
        <p>Current appId: {appId || 'null'}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test DailyRewards Popup</h1>
      <p>App ID loaded: {appId}</p>
      <p>Popup will show in 3 seconds...</p>

      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '400px'
          }}>
            <h2>🎯 Daily Reward Test</h2>
            <p>This is a test popup to verify DailyRewards works</p>
            <p>App ID: {appId}</p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

