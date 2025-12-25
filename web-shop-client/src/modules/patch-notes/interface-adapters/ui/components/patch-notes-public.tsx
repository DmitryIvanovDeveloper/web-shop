'use client';

import { useEffect, useState, useCallback } from 'react';
import { PatchNotesPublicPresenter } from '../../presenters/patch-notes-public.presenter';
import type { PatchNotesPublicViewModel } from '../../view-models/patch-notes-public.view-model';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { PATCH_NOTES_TYPES } from '../../../infrastructure/bootstrap/types';

interface PatchNotesPublicProps {
  appId?: string;
}

interface ChangeItem {
  type: string;
  description: string;
}

interface PatchNoteItem {
  id: string;
  version: string;
  title: string;
  description: string;
  changes: ChangeItem[];
  status: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledFor?: string;
}

export function PatchNotesPublic({ appId = 'default-app' }: PatchNotesPublicProps): JSX.Element | null {
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

  if (viewModel.status === 'loading') {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">Changelog</h1>
        <p className="text-gray-600">Loading updates...</p>
      </div>
    );
  }

  if (viewModel.status === 'error') {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">Changelog</h1>
        <p className="text-red-600">Loading error: {viewModel.error}</p>
      </div>
    );
  }

  if (viewModel.status === 'empty') {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">Changelog</h1>
        <p className="text-gray-600">No updates available.</p>
      </div>
    );
  }

  const getChangeTypeLabel = (type: string): string => {
    switch (type) {
      case 'feature':
        return '✨ New Features';
      case 'bugfix':
        return '🐛 Bug Fixes';
      case 'improvement':
        return '⚡ Improvements';
      case 'breaking-change':
        return '⚠️ Breaking Changes';
      default:
        return type;
    }
  };

  const getChangeTypeColor = (type: string): string => {
    switch (type) {
      case 'feature':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'bugfix':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'improvement':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'breaking-change':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Changelog</h1>

      <div className="space-y-6">
        {viewModel.patchNotes.map((note: PatchNoteItem) => (
          <div key={note.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">{note.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="font-medium">Version {note.version}</span>
                {note.publishedAt && (
                  <span>Published: {new Date(note.publishedAt).toLocaleDateString('en-US')}</span>
                )}
              </div>
              {note.description && (
                <p className="text-gray-700 mb-4 leading-relaxed">{note.description}</p>
              )}
            </div>

            {note.changes && note.changes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Changes:</h3>
                <div className="space-y-2">
                  {note.changes.map((change: ChangeItem, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md border ${getChangeTypeColor(change.type)}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium min-w-fit">
                          {getChangeTypeLabel(change.type)}:
                        </span>
                        <span className="text-sm leading-relaxed">{change.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
