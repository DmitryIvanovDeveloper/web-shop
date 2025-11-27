import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(): Promise<NextResponse> {
  try {
    const filePath = join(
      process.cwd(),
      'public',
      'mocks',
      'api',
      'refunds',
      'summary.json'
    );

    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Failed to load refunds summary mock data', error);
    return NextResponse.json(
      { error: 'Failed to load refunds summary data' },
      { status: 500 }
    );
  }
}


