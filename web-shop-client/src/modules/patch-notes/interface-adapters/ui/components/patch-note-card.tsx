'use client';

import React from 'react';

export interface PatchNoteCardProps {
  id: string;
  version: string;
  title: string;
  description: string;
  changes: Array<{
    type: string;
    description: string;
  }>;
  publishedAt?: string;
  status: string;
}

function getChangeTypeBadge(type: string): { label: string; color: string; icon: string } {
  switch (type) {
    case 'feature':
      return { label: 'Feature', color: '#10B981', icon: '✨' };
    case 'bugfix':
      return { label: 'Fix', color: '#EF4444', icon: '🐛' };
    case 'improvement':
      return { label: 'Improvement', color: '#3B82F6', icon: '⚡' };
    case 'breaking-change':
      return { label: 'Breaking', color: '#F59E0B', icon: '⚠️' };
    default:
      return { label: type, color: '#6B7280', icon: '📝' };
  }
}

export function PatchNoteCard({
  id,
  version,
  title,
  description,
  changes,
  publishedAt,
  status,
}: PatchNoteCardProps): JSX.Element {
  const cardStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '200px',
    backgroundColor: '#0B1220',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    padding: '16px',
    textAlign: 'left',
    position: 'relative',
    opacity: 1,
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  };

  const versionBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '999px',
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    border: '1px solid rgba(96, 165, 250, 0.35)',
    color: '#60A5FA',
    fontSize: '12px',
    fontWeight: 700,
    marginBottom: '12px',
  };

  const titleStyle: React.CSSProperties = {
    marginTop: '0',
    fontSize: '18px',
    fontWeight: 800,
    color: '#F8FAFC',
    lineHeight: 1.3,
    marginBottom: '10px',
  };

  const descriptionStyle: React.CSSProperties = {
    marginTop: '0',
    fontSize: '13px',
    color: '#94A3B8',
    lineHeight: 1.5,
    marginBottom: '16px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const changesContainerStyle: React.CSSProperties = {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const changeItemStyle = (type: string): React.CSSProperties => {
    const badge = getChangeTypeBadge(type);
    return {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      padding: '8px 10px',
      borderRadius: '6px',
      backgroundColor: `${badge.color}15`,
      border: `1px solid ${badge.color}35`,
    };
  };

  const changeTypeStyle = (type: string): React.CSSProperties => {
    const badge = getChangeTypeBadge(type);
    return {
      fontSize: '11px',
      fontWeight: 700,
      color: badge.color,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      minWidth: 'fit-content',
    };
  };

  const changeDescriptionStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#CBD5E1',
    lineHeight: 1.4,
    flex: 1,
  };

  const dateStyle: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.45)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.25)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.35)';
      }}
    >
      {publishedAt && (
        <div style={dateStyle}>{formatDate(publishedAt)}</div>
      )}
      
      <div>
        <div style={versionBadgeStyle}>v{version}</div>
        <div style={titleStyle}>{title}</div>
        <div style={descriptionStyle}>{description}</div>
      </div>

      {changes && changes.length > 0 && (
        <div style={changesContainerStyle}>
          {changes.slice(0, 3).map((change, index) => {
            const badge = getChangeTypeBadge(change.type);
            return (
              <div key={index} style={changeItemStyle(change.type)}>
                <div style={changeTypeStyle(change.type)}>
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
                <div style={changeDescriptionStyle}>{change.description}</div>
              </div>
            );
          })}
          {changes.length > 3 && (
            <div style={{
              fontSize: '11px',
              color: '#64748B',
              textAlign: 'center',
              paddingTop: '4px',
            }}>
              +{changes.length - 3} more changes
            </div>
          )}
        </div>
      )}
    </div>
  );
}

