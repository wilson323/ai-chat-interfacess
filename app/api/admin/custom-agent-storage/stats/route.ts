import { NextRequest, NextResponse } from 'next/server';
import { getCustomAgentStorageStats } from '@/lib/storage/features/management/custom-agent-management';
import { ErrorHandler } from '@/lib/utils/error-handler';

export async function GET(_req: NextRequest) {
  try {
    const stats = await getCustomAgentStorageStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const standardError = ErrorHandler.handle(error, {
      context: 'getCustomAgentStorageStats',
      operation: 'getCustomAgentStorageStats',
    });
    const response = ErrorHandler.toApiResponse(standardError, true);
    return NextResponse.json(response, { status: 500 });
  }
}
