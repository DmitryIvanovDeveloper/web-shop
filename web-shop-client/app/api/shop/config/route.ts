import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Читаем конфигурацию из JSON файла
    const configPath = path.join(process.cwd(), 'public/mocks/api/shop/config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading shop config:', error);
    return NextResponse.json(
      { error: 'Failed to load shop configuration' },
      { status: 500 }
    );
  }
}
