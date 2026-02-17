import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Проверяем разные возможные пути к файлу
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'mocks', 'api', 'products', 'offers', `${id}.json`),
      path.join(process.cwd(), 'webshops-specs', 'web-shop-client', 'public', 'mocks', 'api', 'products', 'offers', `${id}.json`),
      path.join(__dirname, '..', '..', '..', '..', '..', 'public', 'mocks', 'api', 'products', 'offers', `${id}.json`)
    ];

    console.log('Looking for offer file:', id, 'in paths:', possiblePaths);

    let fileContents = '';

    for (const testPath of possiblePaths) {
      try {
        fileContents = fs.readFileSync(testPath, 'utf8');
        console.log('Found offer file at:', testPath);
        break;
      } catch (err) {
        console.log('Path not found:', testPath);
        continue;
      }
    }

    if (!fileContents) {
      console.log('Offer not found:', id);
      return NextResponse.json({}, { status: 404 });
    }

    const offer = JSON.parse(fileContents);
    
    // Ensure offer has id field (use filename if not present)
    if (!offer.id) {
      offer.id = id;
    }
    
    console.log('Offer loaded successfully:', offer.title, 'with id:', offer.id);
    return NextResponse.json(offer);
  } catch (error) {
    console.error('Error loading offer:', error);
    return NextResponse.json({}, { status: 404 });
  }
}

