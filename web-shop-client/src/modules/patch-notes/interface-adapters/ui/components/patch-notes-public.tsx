'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PatchNotesPublicPresenter } from '../../presenters/patch-notes-public.presenter';
import type { PatchNotesPublicViewModel } from '../../view-models/patch-notes-public.view-model';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { PATCH_NOTES_TYPES } from '../../../infrastructure/bootstrap/types';
import { PatchNotesCardsGrid, type PatchNoteItem } from './patch-notes-cards-grid';

interface PatchNotesPublicProps {
  appId: string;
}

export function PatchNotesPublic({ appId }: PatchNotesPublicProps): JSX.Element | null {
  console.log('PatchNotesPublic component rendered with appId:', appId);

  const [updateCounter, setUpdateCounter] = useState(0);
  const [presenter, setPresenter] = useState<PatchNotesPublicPresenter | null>(null);
  const [error, setError] = useState<string | null>(null);

  const forceUpdate = useCallback(() => {
    setUpdateCounter(prev => prev + 1);
  }, []);

  // Try to get presenter synchronously
  if (!presenter && !error) {
    try {
      const presenterInstance = container.get<PatchNotesPublicPresenter>(PATCH_NOTES_TYPES.PatchNotesPublicPresenter);
      setPresenter(presenterInstance);
    } catch (err) {
      setError(`Failed to initialize presenter: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  useEffect(() => {
    if (presenter) {
      try {
        console.log('Loading patch notes for appId:', appId);
        presenter.setOnViewModelChanged(forceUpdate);
        presenter.loadPublishedNotes(appId);
        console.log('Load method called');
      } catch (error) {
        console.error('Failed to load notes:', error);
        setError('Failed to load notes');
      }
    } else {
      console.log('Presenter not available');
    }
  }, [presenter, appId]);

  if (error) {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">Changelog</h1>
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  // Don't render anything until presenter is initialized
  if (!presenter) {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">Changelog</h1>
        <p className="text-gray-600">Initializing...</p>
      </div>
    );
  }

  const viewModel = presenter.getViewModel();

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '2rem 1rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: '2rem',
  };

  if (viewModel.status === 'loading') {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>Changelog</h1>
        <PatchNotesCardsGrid patchNotes={[]} isLoading={true} />
      </div>
    );
  }

  if (viewModel.status === 'error') {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>Changelog</h1>
        <div style={{ textAlign: 'center', color: '#EF4444', padding: '2rem' }}>
          Loading error: {viewModel.error}
        </div>
      </div>
    );
  }

  if (viewModel.status === 'empty') {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>Changelog</h1>
        <div style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem' }}>
          No updates available.
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Changelog</h1>
      <PatchNotesCardsGrid 
        patchNotes={viewModel.patchNotes as PatchNoteItem[]} 
        isLoading={false} 
      />
    </div>
  );
}
