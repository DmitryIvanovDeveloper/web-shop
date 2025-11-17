import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/bootstrap/container';
import { TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId') || 'APP123';

    const supabase = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

    const { data, error } = await supabase
      .from('products')
      .select('id, title, appid')
      .eq('appid', appId)
      .order('title', { ascending: true });

    if (error) {
      console.error('Error loading products from Supabase:', error);
      return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
    }

    return NextResponse.json({ products: data ?? [] });
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}











