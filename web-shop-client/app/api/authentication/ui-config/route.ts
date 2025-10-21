import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    // Проверяем разные возможные пути к файлу
    const possiblePaths = [
      path.join(process.cwd(), 'src', 'modules', 'authentication', 'infrastructure', 'configs', 'auth-ui.config.json'),
      path.join(process.cwd(), 'webshops-specs', 'web-shop-client', 'src', 'modules', 'authentication', 'infrastructure', 'configs', 'auth-ui.config.json'),
      path.join(__dirname, '..', '..', '..', '..', 'src', 'modules', 'authentication', 'infrastructure', 'configs', 'auth-ui.config.json')
    ];

    console.log('Current working directory:', process.cwd());
    console.log('Looking for auth UI config in paths:', possiblePaths);

    let filePath = '';
    let fileContents = '';

    for (const testPath of possiblePaths) {
      try {
        console.log('Trying path:', testPath);
        fileContents = fs.readFileSync(testPath, 'utf8');
        filePath = testPath;
        console.log('Found file at:', filePath);
        break;
      } catch (err) {
        console.log('Path not found:', testPath);
        continue;
      }
    }

    if (!fileContents) {
      throw new Error('Auth UI config file not found in any of the expected locations');
    }

    const authUIConfig = JSON.parse(fileContents);
    console.log('Auth UI config loaded successfully from:', filePath);
    return NextResponse.json(authUIConfig);
  } catch (error) {
    console.error('Error loading auth UI config:', error);
    return NextResponse.json({ error: 'Failed to load auth UI configuration' }, { status: 500 });
  }
}