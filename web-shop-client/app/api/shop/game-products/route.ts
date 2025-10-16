import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Читаем игровые продукты из JSON файла
    const gameProductsPath = path.join(process.cwd(), 'public/mocks/api/shop/game-products.json');
    const gameProductsData = fs.readFileSync(gameProductsPath, 'utf8');
    const gameProducts = JSON.parse(gameProductsData);

    return NextResponse.json(gameProducts);
  } catch (error) {
    console.error('Error loading game products:', error);
    return NextResponse.json(
      { error: 'Failed to load game products' },
      { status: 500 }
    );
  }
}

