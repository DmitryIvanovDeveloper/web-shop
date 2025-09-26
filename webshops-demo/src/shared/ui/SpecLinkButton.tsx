import { useState } from 'react';
import { requestDriveAccessToken } from '../google/auth';
import { findSpecWebViewLink } from '../google/drive';

type Props = {
  moduleName: string;
  scenarioTitle: string;
};

export default function SpecLinkButton({ moduleName, scenarioTitle }: Props) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cfg = (window as any).__SPEC_LINKS_CFG__ as {
    driveId?: string;
    folders?: Record<string, string>;
  } | undefined;

  const onClick = async () => {
    setError(null);
    setLoading(true);
    try {
      const driveId = cfg?.driveId || import.meta.env.VITE_GDRIVE_ID;
      const parentFolderId = cfg?.folders?.[moduleName] || (import.meta.env as any)[`VITE_GDRIVE_${moduleName.toUpperCase()}_FOLDER_ID`];
      if (!driveId) throw new Error('Drive ID is not configured');
      const { accessToken } = await requestDriveAccessToken();
      const link = await findSpecWebViewLink({
        accessToken,
        driveId,
        parentFolderId,
        scenarioQuery: scenarioTitle,
      });
      setUrl(link);
      if (link) window.open(link, '_blank', 'noopener');
      else setError('Spec not found');
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={onClick} disabled={loading} style={{ background:'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'6px 10px', fontWeight:700, cursor: loading ? 'wait' : 'pointer' }}>
      {loading ? 'Opening…' : 'Open spec'}
    </button>
  );
}


