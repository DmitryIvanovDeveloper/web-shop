import { google } from 'googleapis';
import { createHash } from 'crypto';

type RecordItem = {
  key: string; // module:title
  module: string;
  title: string;
  sha256: string;
  mtime: string;
  fileId: string;
  webViewLink?: string;
};

function readEnvMap(): Record<string, string> {
  const env = process.env as Record<string, string | undefined>;
  const map: Record<string, string> = {};
  const modules = [
    'ANALYTICS','MERCHANT','REWARDS','NEWS','LOCALIZATION','SDK','PERSONALIZATION','LIVEOPS','UIBUILDER','WEBSHOP','LOYALTY'
  ];
  for (const m of modules) {
    const id = env[`DRIVE_FOLDER_${m}_ID`];
    if (id) map[m] = id;
  }
  return map;
}

async function getDriveClient() {
  const sa = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!sa) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set');
  const creds = JSON.parse(sa);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const client = await auth.getClient();
  return google.drive({ version: 'v3', auth: client });
}

async function listFilesInFolder(drive: any, driveId: string, folderId: string) {
  const files: any[] = [];
  let pageToken: string | undefined = undefined;
  do {
    const { data } = await drive.files.list({
      corpora: 'drive',
      driveId,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      q: `'${folderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
      fields: 'nextPageToken, files(id,name,modifiedTime,webViewLink,mimeType)',
      pageSize: 200,
      pageToken,
    });
    if (data.files?.length) files.push(...data.files);
    pageToken = data.nextPageToken as string | undefined;
  } while (pageToken);
  return files;
}

async function getFileSha256(drive: any, fileId: string): Promise<string> {
  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
  const hash = createHash('sha256');
  await new Promise<void>((resolve, reject) => {
    res.data
      .on('data', (chunk: Buffer) => hash.update(chunk))
      .on('end', () => resolve())
      .on('error', (e: Error) => reject(e));
  });
  return hash.digest('hex');
}

export const config = { runtime: 'nodejs' } as const;

export default async function handler(req: Request): Promise<Response> {
  try {
    const driveId = process.env.DRIVE_ID as string | undefined;
    if (!driveId) {
      return new Response(JSON.stringify({ error: 'DRIVE_ID is not set' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
    const folderMap = readEnvMap();
    const drive = await getDriveClient();

    const records: RecordItem[] = [];
    for (const [moduleKey, folderId] of Object.entries(folderMap)) {
      const moduleName = moduleKey.toLowerCase().replace(/_/g, '');
      const files = await listFilesInFolder(drive, driveId, folderId);
      for (const f of files) {
        if (!String(f.name).toLowerCase().endsWith('.md')) continue;
        const sha = await getFileSha256(drive, f.id);
        const title = String(f.name).replace(/\.md$/i, '').replace(/^\d+\s*-\s*/,'');
        records.push({
          key: `${moduleName}:${title}`,
          module: moduleName,
          title,
          sha256: sha,
          mtime: f.modifiedTime,
          fileId: f.id,
          webViewLink: f.webViewLink,
        });
      }
    }

    const body = JSON.stringify({ driveId, generatedAt: new Date().toISOString(), records });
    return new Response(body, { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}


