import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePath = path.join(process.cwd(), 'public', 'mocks', 'api', 'products', 'offers.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const offers = JSON.parse(fileContents);
    
    const offer = offers.find((o: any) => o.id === id);
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    
    return NextResponse.json(offer);
  } catch (error) {
    console.error('Error loading offer:', error);
    return NextResponse.json({ error: 'Failed to load offer' }, { status: 500 });
  }
}

