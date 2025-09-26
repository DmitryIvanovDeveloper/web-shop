import { useEffect, useState } from 'react';
import { requestDriveAccessToken } from '../google/auth';
import { findSpecWebViewLink } from '../google/drive';

type Props = {
  moduleName: string;
  scenarioTitle: string;
};

export default function SpecLinkButton({ moduleName, scenarioTitle }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outdated, setOutdated] = useState(false);

  const cfg = (window as any).__SPEC_LINKS_CFG__ as {
    driveId?: string;
    folders?: Record<string, string>;
    aliases?: Record<string, Record<string, string[]>>; // moduleName -> scenarioTitle -> alt queries
  } | undefined;

  // Optional: detect outdated spec by comparing local known sha vs manifest sha
  useEffect(() => {
    const normModule = moduleName.toLowerCase().replace(/_/g, '');
    const key = `${normModule}:${scenarioTitle}`;
    const localVersions = (window as any).__SPEC_VERSIONS__ as Record<string, string> | undefined;
    const localSha = localVersions?.[key];
    if (!localSha) return; // if not provided, skip
    fetch('/api/spec-manifest', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then((manifest) => {
        if (!manifest) return;
        const remoteSha = (manifest.records as any[])?.find?.((r) => r?.key === key)?.sha256;
        if (remoteSha && remoteSha !== localSha) setOutdated(true);
      })
      .catch(() => void 0);
  }, [moduleName, scenarioTitle]);

  const onClick = async () => {
    setError(null);
    setLoading(true);
    try {
      const driveId = cfg?.driveId || import.meta.env.VITE_GDRIVE_ID;
      const env = import.meta.env as any;
      const exactKey = `VITE_GDRIVE_${moduleName.toUpperCase()}_FOLDER_ID`;
      // Alias: Loyalty module may be mapped to REWARDS folder in env
      const aliasKey = moduleName === 'Loyalty' ? 'VITE_GDRIVE_REWARDS_FOLDER_ID' : undefined;
      const parentFolderId = cfg?.folders?.[moduleName] || env[exactKey] || (aliasKey ? env[aliasKey] : undefined);
      if (!driveId) throw new Error('Drive ID is not configured');
      const { accessToken } = await requestDriveAccessToken();
      const alt = cfg?.aliases?.[moduleName]?.[scenarioTitle] || [];
      const candidates = [scenarioTitle, ...alt];
      let link: string | null = null;
      for (const q of candidates) {
        link = await findSpecWebViewLink({ accessToken, driveId, parentFolderId, scenarioQuery: q });
        if (link) break;
      }
      // As a last resort, try without folder scope
      if (!link) {
        for (const q of candidates) {
          link = await findSpecWebViewLink({ accessToken, driveId, scenarioQuery: q });
          if (link) break;
        }
      }
      if (link) window.open(link, '_blank', 'noopener');
      else setError('Spec not found');
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
      {outdated && (
        <span style={{ color:'#fca5a5', fontSize:12, border:'1px solid #7f1d1d', background:'#3f1d1d', padding:'2px 6px', borderRadius:6 }}>Outdated</span>
      )}
      <button onClick={onClick} disabled={loading} style={{ background:'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'6px 10px', fontWeight:700, cursor: loading ? 'wait' : 'pointer' }}>
        {loading ? 'Opening…' : 'Open spec'}
      </button>
      {error && (
        <span style={{ color:'#fca5a5', fontSize:12 }}>{error}</span>
      )}
    </span>
  );
}


