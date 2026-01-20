import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
        const possiblePaths = [
      path.join(process.cwd(), 'src', 'modules', 'authentication', 'infrastructure', 'configs', 'auth-ui.config.json'),
      path.join(process.cwd(), 'webshops-specs', 'web-shop-client', 'src', 'modules', 'authentication', 'infrastructure', 'configs', 'auth-ui.config.json'),
      path.join(__dirname, '..', '..', '..', '..', 'src', 'modules', 'authentication', 'infrastructure', 'configs', 'auth-ui.config.json')
    ];

    console.log('Current working directory:', process.cwd());
        let filePath = '';
    let fileContents = '';

    for (const testPath of possiblePaths) {
      try {
                fileContents = fs.readFileSync(testPath, 'utf8');
        filePath = testPath;
                break;
      } catch (err) {
                continue;
      }
    }

    if (!fileContents) {
      throw new Error('Auth UI config file not found in any of the expected locations');
    }

    const authUIConfig = JSON.parse(fileContents);
        return NextResponse.json(authUIConfig);
  } catch (error) {
        return NextResponse.json({ error: 'Failed to load auth UI configuration' }, { status: 500 });
  }
}