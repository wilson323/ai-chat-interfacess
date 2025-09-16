/**
 * 百度语音服务Token获取API
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, secretKey } = await request.json();

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: '缺少必要的百度配置参数' },
        { status: 400 }
      );
    }

    // 获取百度访问令牌
    const accessToken = await getBaiduAccessToken(apiKey, secretKey);

    return NextResponse.json({ access_token: accessToken });
  } catch (error) {
    console.error('百度Token获取失败:', error);
    return NextResponse.json({ error: 'Token获取失败' }, { status: 500 });
  }
}

/**
 * 获取百度访问令牌
 */
async function getBaiduAccessToken(
  apiKey: string,
  secretKey: string
): Promise<string> {
  const response = await fetch('https://aip.baidubce.com/oauth/2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: secretKey,
    }),
  });

  if (!response.ok) {
    throw new Error(`百度API请求失败: ${response.status}`);
  }

  const data = await response.json();

  if (data.access_token) {
    return data.access_token;
  } else {
    throw new Error(
      `获取百度Token失败: ${data.error_description || '未知错误'}`
    );
  }
}
