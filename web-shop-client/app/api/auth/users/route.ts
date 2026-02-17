import fs from 'fs';
import path from 'path';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function GET(_request: NextRequest) {
  try {
        const mockDataPath = path.join(process.cwd(), 'public', 'mocks', 'api', 'auth', 'users.json');
    
        const mockData = fs.readFileSync(mockDataPath, 'utf8');
    const users = JSON.parse(mockData);
    
    return NextResponse.json(users);
  } catch (_error) {
        return NextResponse.json(
      { error: 'Failed to load users' },
      { status: 500 }
    );
  }
}


