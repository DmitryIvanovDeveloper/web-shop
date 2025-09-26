export type AccessTokenResult = { accessToken: string };

function loadGooglePlatformScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load GIS script')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load GIS script'));
    document.head.appendChild(script);
  });
}

export async function requestDriveAccessToken(scopes: string[] = ['https://www.googleapis.com/auth/drive.metadata.readonly']): Promise<AccessTokenResult> {
  await loadGooglePlatformScript();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) {
    throw new Error('VITE_GOOGLE_CLIENT_ID is not set');
  }

  // 1) Try cached token from sessionStorage
  try {
    const cachedRaw = sessionStorage.getItem('gdrive_token');
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw) as { access_token: string; expires_at: number };
      if (cached?.access_token && typeof cached.expires_at === 'number' && cached.expires_at > Date.now() + 60_000) {
        return Promise.resolve({ accessToken: cached.access_token });
      }
    }
  } catch {}

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: scopes.join(' '),
        callback: (res: any) => {
          if (res?.access_token) {
            const expiresAt = Date.now() + ((res?.expires_in ?? 3600) * 1000);
            try {
              sessionStorage.setItem('gdrive_token', JSON.stringify({ access_token: res.access_token, expires_at: expiresAt }));
            } catch {}
            resolve({ accessToken: res.access_token });
          } else {
            reject(new Error('No access token received'));
          }
        },
      });
      // 2) Silent attempt (no prompt) if consent already granted
      tokenClient.requestAccessToken({ prompt: '' });
    } catch (err) {
      reject(err as Error);
    }
  });
}


