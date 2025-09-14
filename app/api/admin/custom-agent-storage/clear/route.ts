import { NextRequest, NextResponse } from 'next/server';
import { clearAllCustomAgentData } from '@/lib/storage/features/management/custom-agent-management';
import { ErrorHandler } from '@/lib/utils/error-handler';

export async function POST(req: NextRequest) {
  try {
    const result = await clearAllCustomAgentData();

    if (result) {
      return NextResponse.json({
        success: true,
        message: '自研智能体数据清除成功',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '清除数据失败',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const standardError = ErrorHandler.handle(error, {
      operation: 'clearAllCustomAgentData',
    });
    const response = ErrorHandler.toApiResponse(standardError, true);
    return NextResponse.json(response, { status: 500 });
  }
}
