'use client';

import { useEffect, useState } from 'react';
import { PatchNotesPublicPresenter } from '../../presenters/patch-notes-public.presenter';
import type { PatchNotesPublicViewModel } from '../../view-models/patch-notes-public.view-model';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { PATCH_NOTES_TYPES } from '../../../infrastructure/bootstrap/types';

interface PatchNotesPublicProps {
  appId?: string;
}

export function PatchNotesPublic({ appId = 'default-app' }: PatchNotesPublicProps): JSX.Element | null {
  console.log('PatchNotesPublic component rendered with appId:', appId);

  const [, forceUpdate] = useState({});
  const [presenter, setPresenter] = useState<PatchNotesPublicPresenter | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        presenter.setOnViewModelChanged(() => forceUpdate({}));
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
        <h1 className="text-3xl font-bold mb-4">История обновлений</h1>
        <p className="text-red-600">Ошибка: {error}</p>
      </div>
    );
  }

  // Don't render anything until presenter is initialized
  if (!presenter) {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">История обновлений</h1>
        <p className="text-gray-600">Инициализация...</p>
      </div>
    );
  }

  const viewModel = presenter.getViewModel();

  if (viewModel.status === 'loading') {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">История обновлений</h1>
        <p className="text-gray-600">Загрузка обновлений...</p>
      </div>
    );
  }

  if (viewModel.status === 'error') {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">История обновлений</h1>
        <p className="text-red-600">Ошибка загрузки: {viewModel.error}</p>
      </div>
    );
  }

  if (viewModel.status === 'empty') {
    return (
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">История обновлений</h1>
        <p className="text-gray-600">Нет доступных обновлений.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">История обновлений</h1>

      <div className="space-y-6">
        {viewModel.patchNotes.map((note) => (
          <div key={note.id} className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">{note.title}</h2>
            <p className="text-sm text-gray-600 mb-2">Версия {note.version}</p>
            {note.description && <p className="text-gray-700">{note.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
