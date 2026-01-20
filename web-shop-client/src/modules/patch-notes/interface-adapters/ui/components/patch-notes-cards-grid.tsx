'use client';

import React, { useState, useEffect } from 'react';
import { PatchNoteCard } from './patch-note-card';
import { PatchNoteCardSkeleton } from './patch-note-card-skeleton';

export interface PatchNoteItem {
  id: string;
  version: string;
  title: string;
  description: string;
  changes: Array<{
    type: string;
    description: string;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledFor?: string;
}

export interface PatchNotesCardsGridProps {
  patchNotes: readonly PatchNoteItem[];
  isLoading?: boolean;
}

export function PatchNotesCardsGrid({ patchNotes, isLoading = false }: PatchNotesCardsGridProps): JSX.Element {
  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    width: '100%',
    margin: '0',
    padding: '0',
  };

    const getColumns = (width: number): number => {
    if (width >= 1536) return 3;
    if (width >= 1280) return 3;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    if (width >= 480) return 2;
    return 1;
  };

  const [gridStyle, setGridStyle] = useState<React.CSSProperties>(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const columns = getColumns(width);
            const maxCardWidth = width >= 1920 ? '400px' : width >= 1536 ? '380px' : 'none';
      const gridTemplate = maxCardWidth 
        ? `repeat(${columns}, minmax(0, ${maxCardWidth}))`
        : `repeat(${columns}, minmax(0, 1fr))`;
      
      return {
        display: 'grid',
        gridTemplateColumns: gridTemplate,
        gap: '1.5rem',
        width: '100%',
        justifyContent: maxCardWidth ? 'center' : 'start',
      };
    }
    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      gap: '1.5rem',
      width: '100%',
    };
  });

  useEffect(() => {
    const updateGridStyle = () => {
      const width = window.innerWidth;
      const columns = getColumns(width);
            const maxCardWidth = width >= 1920 ? '400px' : width >= 1536 ? '380px' : 'none';
      const gridTemplate = maxCardWidth 
        ? `repeat(${columns}, minmax(0, ${maxCardWidth}))`
        : `repeat(${columns}, minmax(0, 1fr))`;
      
      setGridStyle({
        display: 'grid',
        gridTemplateColumns: gridTemplate,
        gap: '1.5rem',
        width: '100%',
        justifyContent: maxCardWidth ? 'center' : 'start',
      });
    };

    updateGridStyle();
    window.addEventListener('resize', updateGridStyle);
    return () => window.removeEventListener('resize', updateGridStyle);
  }, []);

    const hasNotes = patchNotes.length > 0;
  
  if (isLoading && !hasNotes) {
    return (
      <div style={containerStyle}>
        <div style={gridStyle} className="patch-notes-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <PatchNoteCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

    const sortedNotes = [...patchNotes].sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;   });

  return (
    <div style={containerStyle}>
      <div style={gridStyle} className="patch-notes-grid">
        {sortedNotes.map((note) => (
          <PatchNoteCard
            key={note.id}
            id={note.id}
            version={note.version}
            title={note.title}
            description={note.description}
            changes={note.changes}
            publishedAt={note.publishedAt}
            status={note.status}
          />
        ))}
      </div>
    </div>
  );
}

