'use client';

import React from 'react';

export interface DailyRewardCardProps {
  day: number;
  multiplier: number;
}

export function DailyRewardCard({ day, multiplier }: DailyRewardCardProps): JSX.Element {
  const cardStyle: React.CSSProperties = {
    width: '120px',
    height: '150px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    textAlign: 'center',
    position: 'relative',
  };

  const dayLabelStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  };

  const multiplierStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ff9900',
    marginBottom: '4px',
  };

  const coinsLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  };

  return (
    <div style={cardStyle}>
      <div style={dayLabelStyle}>DAY {day}</div>
      <div style={multiplierStyle}>x{multiplier}</div>
      <div style={coinsLabelStyle}>Coins</div>
    </div>
  );
}
