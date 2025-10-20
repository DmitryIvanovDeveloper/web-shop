import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('[API] Loading products from /api/products/list');
    
    const filePath = path.join(process.cwd(), 'public', 'mocks', 'api', 'products', 'products.json');
    console.log('[API] Reading file:', filePath);
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    console.log('[API] Products loaded:', data.length || 0);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Failed to load products:', error);
    return NextResponse.json(
      { error: 'Failed to load products' },
      { status: 500 }
    );
  }
}
