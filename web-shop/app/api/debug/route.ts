import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/bootstrap/container';
import { TYPES } from '@/infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('Debug endpoint called');

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const envStatus = {
      supabaseUrl: supabaseUrl ? 'Set' : 'Not set',
      supabaseKey: supabaseKey ? 'Set' : 'Not set',
    };

    console.log('Environment variables:', envStatus);

    // Test database connection
    try {
      const databaseClient = container.get<DatabaseClientPort>(TYPES.DatabaseClient);

      console.log('Testing database connection...');

      // Try to query projects table
      const { data, error } = await databaseClient.from('projects').select('*').limit(5);

      if (error) {
        console.error('Database query error:', error);
        return NextResponse.json({
          envStatus,
          databaseError: error.message,
          code: error.code
        }, { status: 500 });
      }

      console.log('Database query successful:', data?.length || 0, 'projects found');

      return NextResponse.json({
        envStatus,
        databaseStatus: 'Connected',
        projectsCount: data?.length || 0,
        projects: data
      });

    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({
        envStatus,
        databaseError: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}