import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

async function logApiError(api: string, error: any) {
  const saveDir = path.join(process.cwd(), 'data')
  await fs.mkdir(saveDir, { recursive: true })
  const filePath = path.join(saveDir, 'api-error.log')
  const msg = `[${new Date().toISOString()}] [${api}] ${error instanceof Error ? error.stack : String(error)}\n`
  await fs.appendFile(filePath, msg)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    let asrProvider = formData.get('asrProvider') as string | undefined
    if (!asrProvider) asrProvider = 'aliyun'
    if (!file) {
      return NextResponse.json({ error: '未检测到音频文件' }, { status: 400 })
    }
    if (asrProvider === 'aliyun') {
      return await aliyunASR(file)
    } else if (asrProvider === 'siliconbase') {
      return await siliconbaseASR(file)
    } else {
      return NextResponse.json({ error: '不支持的ASR服务类型' }, { status: 400 })
    }
  } catch (error) {
    await logApiError('voice-to-text', error)
    return NextResponse.json({ error: '服务异常，请稍后重试' }, { status: 500 })
  }
}

// 阿里云ASR实现
async function aliyunASR(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const appKey = process.env.ALIYUN_APP_KEY
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET
  if (!appKey || !accessKeyId || !accessKeySecret) {
    return NextResponse.json({ error: '阿里云ASR配置缺失' }, { status: 500 })
  }
  const aliyunRes = await fetch(`https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/asr?appkey=${appKey}&format=wav&sample_rate=16000`, {
    method: 'POST',
    headers: {
      'X-NLS-Token': await getAliyunToken(accessKeyId, accessKeySecret),
      'Content-Type': 'application/octet-stream',
    },
    body: buffer,
  })
  const data = await aliyunRes.json()
  if (data.status === 200 && data.result) {
    return NextResponse.json({ text: data.result })
  } else {
    return NextResponse.json({ error: data.message || '识别失败' }, { status: 500 })
  }
}

// 硅基流动ASR实现（示例，需替换为真实API）
async function siliconbaseASR(file: File) {
  // 假设硅基流动API为 https://api.siliconbase.com/asr
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const apiKey = process.env.SILICONBASE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: '硅基流动ASR配置缺失' }, { status: 500 })
  }
  const res = await fetch('https://api.siliconbase.com/asr', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/octet-stream',
    },
    body: buffer,
  })
  const data = await res.json()
  if (data.text) {
    return NextResponse.json({ text: data.text })
  } else {
    return NextResponse.json({ error: data.error || '识别失败' }, { status: 500 })
  }
}

// 获取阿里云Token（需实现缓存，简化为每次获取）
async function getAliyunToken(accessKeyId: string, accessKeySecret: string): Promise<string> {
  const res = await fetch('https://nls-meta.cn-shanghai.aliyuncs.com/pop/2018-05-18/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ AccessKeyId: accessKeyId, AccessKeySecret: accessKeySecret }),
  })
  const data = await res.json()
  if (data && data.Token) return data.Token.Id
  throw new Error('获取阿里云Token失败')
} 