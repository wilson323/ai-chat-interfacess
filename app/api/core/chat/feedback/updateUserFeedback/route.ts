import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { appId, chatId, dataId, userGoodFeedback } = body

    // 验证必要参数
    if (!appId || !chatId || !dataId) {
      return NextResponse.json({ 
        code: 400, 
        message: "缺少必要参数", 
        data: null 
      }, { status: 400 })
    }

    // 获取授权头
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        code: 401, 
        message: "未授权访问", 
        data: null 
      }, { status: 401 })
    }
    const apiKey = authHeader.substring(7) // 去掉 'Bearer ' 前缀

    // 构建请求体
    const requestBody = {
      appId,
      chatId,
      dataId,
      userGoodFeedback
    }

    // 调用外部API
    const targetUrl = "https://zktecoaihub.com/api/core/chat/feedback/updateUserFeedback"
    
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      // 获取响应数据
      const responseData = await response.json()
      
      // 返回与外部API相同的响应格式
      return NextResponse.json({
        code: responseData.code || 200,
        statusText: responseData.statusText || "",
        message: responseData.message || "",
        data: responseData.data || null
      })
    } catch (error) {
      console.error("调用外部反馈API失败:", error)
      return NextResponse.json({ 
        code: 500, 
        message: "调用外部反馈API失败", 
        data: null 
      }, { status: 200 }) // 使用200状态码，让客户端能正常处理
    }
  } catch (error) {
    console.error("处理反馈请求失败:", error)
    return NextResponse.json({ 
      code: 500, 
      message: "处理反馈请求失败", 
      data: null 
    }, { status: 200 }) // 使用200状态码，让客户端能正常处理
  }
}
