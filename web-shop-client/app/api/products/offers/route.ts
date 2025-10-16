import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      'public/mocks/api/products/offers.json'
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Offers not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const offers = JSON.parse(fileContent);

    return NextResponse.json(offers);
  } catch (error) {
    console.error('Error loading offers:', error);
    return NextResponse.json(
      { error: 'Failed to load offers' },
      { status: 500 }
    );
  }
}

