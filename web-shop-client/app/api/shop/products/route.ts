import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
        const productsPath = path.join(process.cwd(), 'public/mocks/api/shop/products.json');
    const productsData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(productsData);

    return NextResponse.json(products);
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to load shop products' },
      { status: 500 }
    );
  }
}



