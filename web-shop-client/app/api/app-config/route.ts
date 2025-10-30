/**
 * API Route: App Config
 * Отдаёт централизованный app-config.json
 * GET /api/app-config
 */

import { NextResponse } from 'next/server';
import appConfig from '../../../public/mocks/api/app-config.json';

export async function GET(): Promise<NextResponse> {
	return NextResponse.json(appConfig, {
		headers: {
			'Cache-Control': 'public, max-age=3600, s-maxage=3600',
			'Content-Type': 'application/json'
		}
	});
}


