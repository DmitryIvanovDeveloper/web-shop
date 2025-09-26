import { useState, useEffect } from 'react';

export function useDocumentUpdateCheck(moduleName: string, scenarioTitle: string) {
  const [isChecking, setIsChecking] = useState(false);
  const [isOutdated, setIsOutdated] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkUpdate = async () => {
    if (!moduleName || !scenarioTitle) return false;
    
    setIsChecking(true);
    console.log('🔍 Checking document update for:', scenarioTitle);
    
    try {
      const normModule = moduleName.toLowerCase().replace(/_/g, '');
      const key = `${normModule}:${scenarioTitle}`;
      
      console.log('📡 Fetching manifest from API...');
      const response = await fetch('/api/spec-manifest', { cache: 'no-store' });
      
      if (!response.ok) {
        console.error('❌ Failed to fetch manifest:', response.status);
        setIsChecking(false);
        return false;
      }

      const manifest = await response.json();
      console.log('📋 Manifest received:', manifest);
      
      const remoteRecord = manifest.records?.find((r: any) => r?.key === key);
      console.log('🔍 Remote record for key', key, ':', remoteRecord);
      
      if (remoteRecord) {
        console.log('✅ Document found in manifest');
        setIsOutdated(false);
      } else {
        console.log('⚠️ Document not found in manifest');
        setIsOutdated(true);
      }
      
      setLastChecked(new Date());
      return isOutdated;
    } catch (e) {
      console.error('❌ Failed to check document update:', e);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-check when moduleName or scenarioTitle changes
  useEffect(() => {
    if (moduleName && scenarioTitle) {
      checkUpdate();
    }
  }, [moduleName, scenarioTitle]);

  return {
    isChecking,
    isOutdated,
    lastChecked,
    checkUpdate,
    showResult: (callback: (result: {scenario: string, isOutdated: boolean, lastChecked: Date}) => void) => {
      if (moduleName && scenarioTitle) {
        checkUpdate().then(() => {
          callback({
            scenario: scenarioTitle,
            isOutdated,
            lastChecked: new Date()
          });
        });
      }
    }
  };
}
