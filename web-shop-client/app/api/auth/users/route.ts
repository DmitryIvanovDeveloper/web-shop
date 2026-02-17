import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
        const mockDataPath = path.join(process.cwd(), 'public', 'mocks', 'api', 'auth', 'users.json');
    
        const mockData = fs.readFileSync(mockDataPath, 'utf8');
    const users = JSON.parse(mockData);
    
    return NextResponse.json(users);
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to load users' },
      { status: 500 }
    );
  }
}


