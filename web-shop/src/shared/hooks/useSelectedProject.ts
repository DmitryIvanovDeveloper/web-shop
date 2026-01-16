import { useState, useEffect } from 'react';

interface SelectedProject {
  merchantId: string;
  projectId: string;
  appId: string;
  projectName: string;
  selectedAt: string;
}

export function useSelectedProject() {
  const [selectedProject, setSelectedProject] = useState<SelectedProject | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedProject');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSelectedProject(parsed);
        } catch (error) {
          console.error('Error parsing selected project from localStorage:', error);
        }
      }
    }

    // Listen for project selection events
    const handleProjectSelected = (event: CustomEvent<SelectedProject>) => {
      setSelectedProject(event.detail);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('projectSelected', handleProjectSelected as EventListener);

      return () => {
        window.removeEventListener('projectSelected', handleProjectSelected as EventListener);
      };
    }
  }, []);

  const getAppId = (): string | null => {
    return selectedProject?.appId || null;
  };

  const getProject = (): SelectedProject | null => {
    return selectedProject;
  };

  const clearSelection = () => {
    setSelectedProject(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedProject');
    }
  };

  return {
    selectedProject,
    appId: getAppId(),
    getProject,
    clearSelection
  };
}


