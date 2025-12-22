'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PatchNotesAdminPresenter } from '../presenters/patch-notes-admin.presenter';
import type { PatchNotesAdminViewModel } from '../view-models/patch-notes-admin.view-model';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { MERCHANT_ADMIN_PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';

interface FormData {
  version: string;
  title: string;
  description: string;
  changes: Array<{ type: 'feature' | 'bugfix' | 'improvement' | 'breaking-change'; description: string }>;
}

export function PatchNotesAdmin(): JSX.Element {
  const searchParams = useSearchParams();
  const appId = searchParams.get('appId') || 'default-app';

  const [, forceUpdate] = useState({});
  const [presenter] = useState(() =>
    container.get<PatchNotesAdminPresenter>(MERCHANT_ADMIN_PATCH_NOTES_TYPES.PatchNotesAdminPresenter)
  );

  const [formData, setFormData] = useState<FormData>({
    version: '',
    title: '',
    description: '',
    changes: [{ type: 'feature', description: '' }]
  });

  useEffect(() => {
    presenter.setOnViewModelChanged(() => forceUpdate({}));
    presenter.loadPatchNotes(appId);
  }, [presenter, appId]);

  const viewModel = presenter.getViewModel();

  const handleCreateNew = () => {
    presenter.openCreateModal();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.version || !formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.changes.some(change => !change.description.trim())) {
      alert('All change descriptions must be filled');
      return;
    }

    const success = await presenter.createPatchNote({
      appId,
      version: formData.version,
      title: formData.title,
      description: formData.description,
      changes: formData.changes.map(change => ({
        type: change.type,
        description: change.description.trim()
      }))
    });

    if (success) {
      setFormData({
        version: '',
        title: '',
        description: '',
        changes: [{ type: 'feature', description: '' }]
      });
      presenter.closeCreateModal();
    }
  };

  const addChange = () => {
    setFormData(prev => ({
      ...prev,
      changes: [...prev.changes, { type: 'feature', description: '' }]
    }));
  };

  const removeChange = (index: number) => {
    if (formData.changes.length > 1) {
      setFormData(prev => ({
        ...prev,
        changes: prev.changes.filter((_, i) => i !== index)
      }));
    }
  };

  const updateChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      changes: prev.changes.map((change, i) =>
        i === index ? { ...change, [field]: value } : change
      )
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patch Notes Management</h1>
        <p className="text-gray-600 mt-2">
          Manage patch notes and version updates for your application
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            <strong>Current App ID:</strong> {appId}
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Patch Notes</h2>
          <p className="text-gray-600 text-sm mt-1">
            {viewModel.patchNotes.length} patch note{viewModel.patchNotes.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Create New Patch Note
        </button>
      </div>

      {/* Error Message */}
      {viewModel.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-red-800">{viewModel.error}</p>
            <button
              onClick={() => presenter.clearError()}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {viewModel.status === 'loading' && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading patch notes...</span>
        </div>
      )}

      {/* Empty State */}
      {viewModel.status === 'loaded' && viewModel.patchNotes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No patch notes yet</h3>
          <p className="text-gray-600 mb-6">Create your first patch note to get started</p>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Create First Patch Note
          </button>
        </div>
      )}

      {/* Patch Notes List */}
      {viewModel.status === 'loaded' && viewModel.patchNotes.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {viewModel.patchNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        v{note.version}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{note.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {note.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        note.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : note.status === 'scheduled'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {note.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => presenter.openEditModal(note)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        {note.status === 'draft' && (
                          <>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => presenter.openDeleteModal(note)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {viewModel.isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Create New Patch Note</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              {/* Version and Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version *
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Semantic version format (x.y.z)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Major Feature Release"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the main changes and improvements..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Changes */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Changes *
                  </label>
                  <button
                    type="button"
                    onClick={addChange}
                    className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md"
                  >
                    + Add Change
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.changes.map((change, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <select
                        value={change.type}
                        onChange={(e) => updateChange(index, 'type', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="feature">✨ Feature</option>
                        <option value="bugfix">🐛 Bug Fix</option>
                        <option value="improvement">⚡ Improvement</option>
                        <option value="breaking-change">💥 Breaking Change</option>
                      </select>

                      <input
                        type="text"
                        value={change.description}
                        onChange={(e) => updateChange(index, 'description', e.target.value)}
                        placeholder="Describe the change..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />

                      {formData.changes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChange(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => presenter.closeCreateModal()}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={viewModel.status === 'creating'}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  {viewModel.status === 'creating' ? 'Creating...' : 'Create Patch Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal Placeholder */}
      {viewModel.isEditModalOpen && viewModel.selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Patch Note</h3>
            <p className="text-gray-600 mb-4">
              Feature coming soon! This will allow editing existing patch notes.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => presenter.closeEditModal()}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal Placeholder */}
      {viewModel.isDeleteModalOpen && viewModel.selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Patch Note</h3>
            <p className="text-red-600 mb-4">
              Are you sure you want to delete patch note "{viewModel.selectedNote.title}" (v{viewModel.selectedNote.version})?
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Feature coming soon! This will allow deleting patch notes.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => presenter.closeDeleteModal()}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => presenter.closeDeleteModal()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
