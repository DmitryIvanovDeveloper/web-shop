import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
        const configPath = path.join(process.cwd(), 'public/mocks/api/shop/config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    return NextResponse.json(config);
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to load shop configuration' },
      { status: 500 }
    );
  }
}


