/**
 * 阿里云语音服务Token获取API
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { accessKeyId, accessKeySecret, region } = await request.json();

    if (!accessKeyId || !accessKeySecret) {
      return NextResponse.json(
        { error: '缺少必要的阿里云配置参数' },
        { status: 400 }
      );
    }

    // 生成阿里云Token
    const token = await generateAliyunToken(
      accessKeyId,
      accessKeySecret,
      region
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('阿里云Token生成失败:', error);
    return NextResponse.json({ error: 'Token生成失败' }, { status: 500 });
  }
}

/**
 * 生成阿里云访问令牌
 */
async function generateAliyunToken(
  accessKeyId: string,
  accessKeySecret: string,
  region: string
): Promise<string> {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');

  // 构建签名字符串
  const signString = `GET\n/\nAccessKeyId=${accessKeyId}&Action=CreateToken&Format=JSON&RegionId=${region}&SignatureMethod=HMAC-SHA1&SignatureNonce=${nonce}&SignatureVersion=1.0&Timestamp=${timestamp}&Version=2019-02-28`;

  // 生成签名
  const signature = crypto
    .createHmac('sha1', accessKeySecret + '&')
    .update(signString)
    .digest('base64');

  // 构建请求参数
  const params = new URLSearchParams({
    AccessKeyId: accessKeyId,
    Action: 'CreateToken',
    Format: 'JSON',
    RegionId: region,
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: nonce,
    SignatureVersion: '1.0',
    Timestamp: timestamp.toString(),
    Version: '2019-02-28',
    Signature: signature,
  });

  // 请求阿里云API
  const response = await fetch(
    `https://nls-meta.cn-${region}.aliyuncs.com/?${params}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`阿里云API请求失败: ${response.status}`);
  }

  const result = await response.json();

  if (result.Token) {
    return result.Token.Id;
  } else {
    throw new Error(`获取Token失败: ${result.Message || '未知错误'}`);
  }
}
