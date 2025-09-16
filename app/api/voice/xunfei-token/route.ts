/**
 * 科大讯飞语音服务Token获取API
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { appId, apiKey, apiSecret } = await request.json();

    if (!appId || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: '缺少必要的讯飞配置参数' },
        { status: 400 }
      );
    }

    // 生成讯飞Token
    const token = await generateXunfeiToken(appId, apiKey, apiSecret);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('讯飞Token生成失败:', error);
    return NextResponse.json({ error: 'Token生成失败' }, { status: 500 });
  }
}

/**
 * 生成科大讯飞访问令牌
 */
async function generateXunfeiToken(
  _appId: string,
  apiKey: string,
  apiSecret: string
): Promise<string> {
  const now = new Date();
  const date = now.toUTCString();
  const algorithm = 'hmac-sha256';
  const headers = 'host date request-line';
  const signatureOrigin = `host: iat-api.xfyun.cn\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
  const signatureSha = crypto
    .createHmac('sha256', apiSecret)
    .update(signatureOrigin)
    .digest('base64');

  const authorization = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signatureSha}"`;

  return authorization;
}
