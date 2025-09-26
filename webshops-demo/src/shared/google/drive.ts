export type FindSpecParams = {
  accessToken: string;
  driveId: string;
  parentFolderId?: string;
  scenarioQuery: string; // name contains '...'
};

export async function findSpecWebViewLink(params: FindSpecParams): Promise<string | null> {
  const { accessToken, driveId, parentFolderId, scenarioQuery } = params;
  const qParts = [
    `name contains '${scenarioQuery.replace(/'/g, "\\'")}'`,
    'trashed=false',
  ];
  if (parentFolderId) qParts.push(`'${parentFolderId}' in parents`);
  const q = qParts.join(' and ');
  const usp = new URLSearchParams({
    q,
    corpora: 'drive',
    driveId,
    includeItemsFromAllDrives: 'true',
    supportsAllDrives: 'true',
    fields: 'files(id,name,webViewLink,mimeType)',
    pageSize: '5',
  });
  const resp = await fetch(`https://www.googleapis.com/drive/v3/files?${usp.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  const file = data?.files?.[0];
  return file?.webViewLink ?? null;
}



