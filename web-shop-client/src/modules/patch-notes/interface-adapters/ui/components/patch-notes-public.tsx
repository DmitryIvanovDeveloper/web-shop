'use client';

import { useEffect, useState } from 'react';
import { PatchNotesPublicPresenter } from '../../presenters/patch-notes-public.presenter';
import type { PatchNotesPublicViewModel } from '../../view-models/patch-notes-public.view-model';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { PATCH_NOTES_TYPES } from '../../../infrastructure/bootstrap/types';

export function PatchNotesPublic(): JSX.Element | null {
  const [, forceUpdate] = useState({});
  const [presenter] = useState(() =>
    container.get<PatchNotesPublicPresenter>(PATCH_NOTES_TYPES.PatchNotesPublicPresenter)
  );

  useEffect(() => {
    presenter.setOnViewModelChanged(() => forceUpdate({}));
    presenter.loadPublishedNotes();
  }, [presenter]);

  const viewModel = presenter.getViewModel();

  if (viewModel.status === 'loading') {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (viewModel.status === 'error') {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading patch notes</div>
        <div className="text-gray-600 text-sm">{viewModel.error}</div>
      </div>
    );
  }

  if (viewModel.status === 'empty') {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600">No patch notes available</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">Patch Notes & Updates</h1>

      <div className="space-y-6">
        {viewModel.patchNotes.map((note) => (
          <PatchNoteCard
            key={note.id}
            note={note}
            isSelected={viewModel.selectedNoteId === note.id}
            onClick={() => presenter.selectNote(note.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface PatchNoteCardProps {
  note: PatchNotesPublicViewModel['patchNotes'][0];
  isSelected: boolean;
  onClick: () => void;
}

function PatchNoteCard({ note, isSelected, onClick }: PatchNoteCardProps): JSX.Element {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'text-green-400';
      case 'bugfix': return 'text-red-400';
      case 'improvement': return 'text-blue-400';
      case 'breaking-change': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return '✨';
      case 'bugfix': return '🐛';
      case 'improvement': return '⚡';
      case 'breaking-change': return '💥';
      default: return '📝';
    }
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:bg-gray-700'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">
            {note.title}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span className="font-mono bg-gray-700 px-2 py-1 rounded">
              v{note.version}
            </span>
            <span>
              {note.publishedAt ? formatDate(note.publishedAt) : 'Not published yet'}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              note.status === 'published' ? 'bg-green-900 text-green-300' :
              note.status === 'scheduled' ? 'bg-yellow-900 text-yellow-300' :
              'bg-gray-700 text-gray-300'
            }`}>
              {note.status}
            </span>
          </div>
        </div>
        {isSelected && (
          <div className="text-blue-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Description */}
      {note.description && (
        <p className="text-gray-300 mb-4 leading-relaxed">
          {note.description}
        </p>
      )}

      {/* Changes */}
      {note.changes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Changes
          </h3>
          <div className="space-y-1">
            {note.changes.map((change, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-lg">{getChangeTypeIcon(change.type)}</span>
                <span className={`flex-1 ${getChangeTypeColor(change.type)}`}>
                  {change.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expand indicator */}
      {!isSelected && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          Click to expand
        </div>
      )}
    </div>
  );
}
