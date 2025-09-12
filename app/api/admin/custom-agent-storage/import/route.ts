import { NextRequest, NextResponse } from 'next/server'
import { importCustomAgentData } from '@/lib/storage/features/management/custom-agent-management'
import { ErrorHandler, ValidationError } from '@/lib/utils/error-handler'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      const error = new ValidationError('未找到上传文件')
      const response = ErrorHandler.toApiResponse(error.toStandardError())
      return NextResponse.json(response, { status: 400 })
    }

    // 验证文件类型
    if (!file.name.endsWith('.json')) {
      const error = new ValidationError('文件类型必须是JSON格式')
      const response = ErrorHandler.toApiResponse(error.toStandardError())
      return NextResponse.json(response, { status: 400 })
    }

    // 读取文件内容
    const fileContent = await file.text()
    let data
    try {
      data = JSON.parse(fileContent)
    } catch (parseError) {
      const error = new ValidationError('JSON文件格式错误')
      const response = ErrorHandler.toApiResponse(error.toStandardError())
      return NextResponse.json(response, { status: 400 })
    }

    // 验证数据格式
    if (!Array.isArray(data)) {
      const error = new ValidationError('数据格式错误，必须是数组格式')
      const response = ErrorHandler.toApiResponse(error.toStandardError())
      return NextResponse.json(response, { status: 400 })
    }

    const result = await importCustomAgentData(data)
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: '自研智能体数据导入成功',
        importedCount: data.length
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '导入数据失败'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    const standardError = ErrorHandler.handle(error, { operation: 'importCustomAgentData' })
    const response = ErrorHandler.toApiResponse(standardError, true)
    return NextResponse.json(response, { status: 500 })
  }
}
