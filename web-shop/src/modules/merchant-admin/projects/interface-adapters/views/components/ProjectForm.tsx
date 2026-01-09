'use client';

import React, { useState, useEffect } from 'react';
import { ProjectListItemViewModel } from '../../view-models/projects.view-model';

interface ProjectFormData {
  name: string;
  description: string;
}

interface ProjectFormProps {
  project?: ProjectListItemViewModel | null;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Create Project'
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: ''
  });

  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
  }, [project]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: '',
        description: ''
      });
      setErrors({});
    } catch (error) {
      // Error handling is done in the presenter
    }
  };

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          `}
          placeholder="Enter project name"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>


      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          `}
          placeholder="Enter project description (optional)"
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formData.description.length}/500 characters
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="
            px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
            bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
            rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            px-4 py-2 text-sm font-medium text-white
            bg-blue-600 border border-transparent rounded-md shadow-sm
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};