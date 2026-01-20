import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  try {
    
    if (!path || path.length === 0) {
      return NextResponse.json({ error: 'No path provided' }, { status: 400 });
    }

    const apiPath = `/${path.join('/')}`;

    const cleanApiPath = apiPath.replace(/\.json$/, '');

    const mockFilePath = mapApiPathToMockFile(cleanApiPath);
    
    if (!mockFilePath) {
      return NextResponse.json({ error: 'Mock file not found' }, { status: 404 });
    }

    const filePath = join(process.cwd(), 'public/mocks/api', mockFilePath);
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to load mock data' }, 
      { status: 500 }
    );
  }
}

function mapApiPathToMockFile(apiPath: string): string | null {
  
  const mapping: Record<string, string> = {
    '/api/sales/summary': 'sales/summary.json',
    '/api/revenue/summary': 'revenue/summary.json',
    '/api/geography/summary': 'geography/summary.json',
    '/api/conversion/summary': 'conversion/summary.json',
    '/api/payment/summary': 'payment/summary.json',
    '/api/platform/summary': 'platform/summary.json',
    '/api/product/summary': 'product/summary.json',
    '/api/metrics/catalog': 'metrics/catalog.json'
  };

  return mapping[apiPath] || null;
}