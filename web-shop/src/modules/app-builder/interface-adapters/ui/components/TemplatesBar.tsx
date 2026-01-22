'use client';

import React, { useEffect, useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
}

interface TemplatesBarProps {
  onSelectTemplate: (templateId: string) => void;
}

export const TemplatesBar: React.FC<TemplatesBarProps> = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/app-builder/templates');
        
        if (!response.ok) {
          throw new Error(`Failed to load templates: ${response.statusText}`);
        }

        const result = await response.json();
        setTemplates(result.data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Failed to load templates:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedId(templateId);
    onSelectTemplate(templateId);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm text-gray-600">Loading templates...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-b border-red-200 px-6 py-3">
        <p className="text-sm text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <p className="text-sm text-gray-500">No templates available</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Templates:</span>
        <div className="flex gap-2 overflow-x-auto">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              title={template.description}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedId === template.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
              }`}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
