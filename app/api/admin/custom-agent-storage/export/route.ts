import { NextRequest, NextResponse } from 'next/server'
import { exportAllCustomAgentData } from '@/lib/storage/features/management/custom-agent-management'
import { ErrorHandler } from '@/lib/utils/error-handler'

export async function GET(req: NextRequest) {
  try {
    const data = await exportAllCustomAgentData()
    
    const jsonData = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="custom-agent-data-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (error) {
    const standardError = ErrorHandler.handle(error, { operation: 'exportAllCustomAgentData' })
    const response = ErrorHandler.toApiResponse(standardError, true)
    return NextResponse.json(response, { status: 500 })
  }
}
