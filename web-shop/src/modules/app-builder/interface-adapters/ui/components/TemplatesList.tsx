'use client';

import { useEffect, useState } from 'react';
import { container } from '@/infrastructure/bootstrap/container';
import { APP_BUILDER_TYPES } from '@/modules/app-builder/infrastructure/bootstrap/types';
import type { TemplatesPresenter } from '@/modules/app-builder/interface-adapters/presenters/templates.presenter';
import type { TemplatesViewModel } from '@/modules/app-builder/interface-adapters/presenters/templates.presenter';

export interface TemplatesListProps {
  onSelectTemplate?: (templateData: any) => void;
  onApply?: () => Promise<void>;
  onSaveTemplate?: (name: string, description?: string) => Promise<void>;
  appId?: string;
  merchantId?: string;
  canEdit?: boolean;
}

export function TemplatesList({
  onSelectTemplate,
  onApply,
  onSaveTemplate,
  appId,
  merchantId,
  canEdit = true
}: TemplatesListProps) {
  const [vm, setVm] = useState<TemplatesViewModel | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const [presenter] = useState(() =>
    container.get<TemplatesPresenter>(APP_BUILDER_TYPES.TemplatesPresenter)
  );

  useEffect(() => {
    const unsubscribe = presenter.subscribe(setVm);
    presenter.loadTemplates();
    return unsubscribe;
  }, [presenter]);

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !onSaveTemplate) {
      alert('Please enter a template name');
      return;
    }

    setIsSavingTemplate(true);
    try {
      await onSaveTemplate(templateName.trim(), templateDescription.trim() || undefined);
      setShowSaveDialog(false);
      setTemplateName('');
      setTemplateDescription('');
      presenter.loadTemplates();
      alert('✅ Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert(`❌ Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  if (!vm) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Initializing...</div>
      </div>
    );
  }

  if (vm.isLoadingList) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  if (vm.error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{vm.error}</p>
          <button
            onClick={() => presenter.loadTemplates()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!canEdit && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">⚠️ Read-only mode: editing disabled</p>
        </div>
      )}

      {vm.templates.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">No templates available</p>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📚 Templates</h3>
            {canEdit && onSaveTemplate && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                💾 Save Template
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vm.templates.map((template) => (
                  <tr
                    key={template.id}
                    className={`transition ${
                      vm.selectedTemplateId === template.id ? 'bg-blue-50' : ''
                    } ${canEdit ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'}`}
                    onClick={canEdit ? async () => {
                      await presenter.selectTemplate(template.id);
                      const currentVm = presenter.getViewModel();

                      if (currentVm.selectedTemplate?.templateData && onSelectTemplate) {
                        onSelectTemplate(currentVm.selectedTemplate.templateData);
                      }
                    } : undefined}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {vm.selectedTemplateId === template.id && (
                          <svg
                            className="h-4 w-4 text-blue-600 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        <span className="text-sm font-medium text-gray-900">{template.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 line-clamp-1">
                        {template.description || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {template.updatedAt ? template.updatedAt.toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (canEdit && onApply) {
                            await onApply();
                          }
                        }}
                        disabled={!canEdit}
                        className={`text-sm font-medium ${
                          canEdit
                            ? 'text-blue-600 hover:text-blue-800'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {canEdit ? 'Apply' : 'Read-only'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">💾 Save Template</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSavingTemplate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Enter template description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSavingTemplate}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                disabled={isSavingTemplate}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim() || isSavingTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSavingTemplate && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isSavingTemplate ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}