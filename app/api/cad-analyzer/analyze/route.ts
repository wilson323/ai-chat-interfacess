import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { CadAnalyzerConfig } from '@/types/api/agent-config/cad-analyzer'
import AgentConfig from '@/lib/db/models/agent-config'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123'

// 读取安全配置参数 - 从数据库获取
async function getSafeConfig(): Promise<Pick<CadAnalyzerConfig, 'maxFileSizeMB' | 'supportedFormats'>> {
  try {
    // 从数据库获取CAD解读智能体配置
    const cadAgent = await AgentConfig.findOne({
      where: {
        type: 'cad-analyzer',
        isPublished: true
      }
    });

    if (!cadAgent) {
      console.log('未找到已发布的CAD解读智能体配置，使用默认配置');
      return {
        maxFileSizeMB: 100,
        supportedFormats: ['.dwg', '.dxf', '.pdf', '.jpg', '.png']
      };
    }

    // 返回安全配置
    return {
      maxFileSizeMB: 100, // 固定值或从其他字段获取
      supportedFormats: ['.dwg', '.dxf', '.pdf', '.jpg', '.png'] // 固定支持的格式
    };
  } catch (error) {
    console.error('获取CAD解读智能体配置失败:', error);
    return {
      maxFileSizeMB: 100,
      supportedFormats: ['.dwg', '.dxf', '.pdf', '.jpg', '.png']
    };
  }
}

// AI大模型分析提示词（可根据业务需求优化）
const CAD_ANALYSIS_PROMPT = `请对上传的CAD图纸或图片进行安防设备智能识别和结构化分析，输出如下JSON结构：
{
  "devices": [
    { "type": "摄像机", "count": 2, "coordinates": [{"x":100,"y":200}, ...] },
    { "type": "门禁", "count": 1, "coordinates": [{"x":300,"y":400}] },
    ...
  ],
  "summary": "简要描述本图纸安防布局、异常点、布线信息等"
}`;

async function logApiError(api: string, error: any) {
  const saveDir = path.join(process.cwd(), 'data')
  await fs.mkdir(saveDir, { recursive: true })
  const filePath = path.join(saveDir, 'api-error.log')
  const msg = `[${new Date().toISOString()}] [${api}] ${error instanceof Error ? error.stack : String(error)}\n`
  await fs.appendFile(filePath, msg)
}

// TODO: 调用AI大模型API进行智能分析，返回结构化内容
async function analyzeWithAI(filePath: string, ext: string): Promise<any> {
  // 示例：调用FastGPT或自定义AI API，传入CAD图片/文件和CAD_ANALYSIS_PROMPT
  // 实际生产环境需对接真实AI推理服务
  // 返回结构化JSON
  return {
    devices: [
      { type: "摄像机", count: 2, coordinates: [{ x: 100, y: 200 }, { x: 300, y: 400 }] },
      { type: "门禁", count: 1, coordinates: [{ x: 500, y: 600 }] },
    ],
    summary: "检测到摄像机2台、门禁1台，布局合理，无明显异常。布线信息正常。"
  };
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
    if (!file) {
      return NextResponse.json({ error: '未检测到文件' }, { status: 400 })
    }
    // 校验文件大小和格式
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    // 确保supportedFormats存在且是数组
    const supportedFormats = safeConfig.supportedFormats || ['.dwg', '.dxf', '.pdf', '.jpg', '.png']
    const supportedExtensions = supportedFormats.map(f => f.replace('.', ''))

    if (!supportedExtensions.includes(ext)) {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 })
    }

    const maxFileSizeMB = safeConfig.maxFileSizeMB || 20
    if (file.size > (maxFileSizeMB * 1024 * 1024)) {
      return NextResponse.json({ error: `文件过大，最大${maxFileSizeMB}MB` }, { status: 400 })
    }
    const fileName = `${Date.now()}_${file.name}`
    // 确保目录存在
    const saveDir = path.join(process.cwd(), 'public', 'cad-analyzer')
    try {
      await fs.mkdir(saveDir, { recursive: true })
      console.log(`目录创建成功: ${saveDir}`)
    } catch (err) {
      console.error(`创建目录失败: ${saveDir}`, err)
      // 尝试使用临时目录
      const tempDir = path.join(process.cwd(), 'tmp')
      await fs.mkdir(tempDir, { recursive: true })
      console.log(`使用临时目录: ${tempDir}`)
    }

    const filePath = path.join(saveDir, fileName)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      await fs.writeFile(filePath, buffer)
      console.log(`文件保存成功: ${filePath}`)
    } catch (err) {
      console.error(`文件保存失败: ${filePath}`, err)
      throw new Error(`文件保存失败: ${err.message}`)
    }
    const url = `/cad-analyzer/${fileName}`

    // 简单模拟分析逻辑
    let analysis = ''
    let structured = null
    const imageFormats = ["jpg","jpeg","png","gif","bmp","webp"]
    const cadFormats = ["dxf","dwg"]

    if (imageFormats.includes(ext) || cadFormats.includes(ext)) {
      // AI大模型分析
      structured = await analyzeWithAI(filePath, ext)
      analysis = structured.summary + '\n设备清单：' + JSON.stringify(structured.devices, null, 2)
    } else {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 })
    }

    // 生成报告（简单文本）
    const reportName = `report_${Date.now()}.txt`
    const reportPath = path.join(saveDir, reportName)
    await fs.writeFile(reportPath, analysis)
    const reportUrl = `/cad-analyzer/${reportName}`

    // 生成结构化JSON报告
    const structuredReportName = `structured_${Date.now()}.json`
    const structuredReportPath = path.join(saveDir, structuredReportName)
    await fs.writeFile(structuredReportPath, JSON.stringify(structured, null, 2))
    const structuredReportUrl = `/cad-analyzer/${structuredReportName}`

    return NextResponse.json({ url, analysis, reportUrl, structuredReportUrl, structured })
  } catch (error) {
    console.error('CAD解读智能体分析错误:', error);
    await logApiError('cad-analyzer-analyze', error)

    // 返回更详细的错误信息，帮助调试
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      error: '服务异常，请稍后重试',
      detail: errorMessage,
      success: false
    }, { status: 500 })
  }
}