import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { ImageEditorConfig } from '@/types/api/agent-config/image-editor'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123'
const CONFIG_PATH = path.resolve(process.cwd(), 'config/image-editor-config.json')

// 读取安全配置参数
async function getSafeConfig(): Promise<Pick<ImageEditorConfig, 'maxImageSizeMB' | 'supportedFormats'>> {
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf-8')
    const config: ImageEditorConfig = JSON.parse(content)
    return {
      maxImageSizeMB: config.maxImageSizeMB,
      supportedFormats: config.supportedFormats,
    }
  } catch {
    return { maxImageSizeMB: 10, supportedFormats: ['.jpg', '.png', '.bmp', '.tiff'] }
  }
}

async function logApiError(api: string, error: any) {
  const saveDir = path.join(process.cwd(), 'data')
  await fs.mkdir(saveDir, { recursive: true })
  const filePath = path.join(saveDir, 'api-error.log')
  const msg = `[${new Date().toISOString()}] [${api}] ${error instanceof Error ? error.stack : String(error)}\n`
  await fs.appendFile(filePath, msg)
}

export async function POST(req: NextRequest) {
  try {
    // 读取安全配置
    const safeConfig = await getSafeConfig()
    const token = req.headers.get('x-admin-token')
    if (token !== ADMIN_TOKEN) {
      return NextResponse.json({ error: '无权限' }, { status: 401 })
    }
    const formData = await req.formData()
    const file = formData.get('file') as File
    const marks = formData.get('marks') as string // JSON字符串
    if (!file) {
      return NextResponse.json({ error: '未检测到图片文件' }, { status: 400 })
    }
    // 校验文件大小和格式
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!safeConfig.supportedFormats.map(f=>f.replace('.','')).includes(ext)) {
      return NextResponse.json({ error: '不支持的图片类型' }, { status: 400 })
    }
    if (file.size > (safeConfig.maxImageSizeMB * 1024 * 1024)) {
      return NextResponse.json({ error: `图片过大，最大${safeConfig.maxImageSizeMB}MB` }, { status: 400 })
    }
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileName = `edit_${Date.now()}.png`
    const saveDir = path.join(process.cwd(), 'public', 'image-edits')
    await fs.mkdir(saveDir, { recursive: true })
    const filePath = path.join(saveDir, fileName)
    await fs.writeFile(filePath, buffer)
    const url = `/image-edits/${fileName}`
    return NextResponse.json({ url, marks: marks ? JSON.parse(marks) : [] })
  } catch (error) {
    await logApiError('image-editor-save', error)
    return NextResponse.json({ error: '服务异常，请稍后重试' }, { status: 500 })
  }
} 