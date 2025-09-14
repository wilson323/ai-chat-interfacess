import { NextResponse } from 'next/server';
import sequelize from '@/lib/db/sequelize';

export async function GET() {
  // This route can be used to fetch non-sensitive configuration
  // Note: NEVER return sensitive API keys directly from API routes
  return NextResponse.json({
    apiEndpoint: 'https://zktecoaihub.com/api/v1/chat/completions',
    // For actual API keys, use a more secure approach like:
    // 1. User authentication + database to store user-specific keys
    // 2. Server-side proxying of requests that need the API key
    // 3. OAuth or token exchange systems
  });
}
