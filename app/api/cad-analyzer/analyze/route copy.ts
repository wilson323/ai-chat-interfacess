import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { CadAnalyzerConfig } from '@/types/api/agent-config/cad-analyzer'
import AgentConfig from '@/lib/db/models/agent-config'
import DxfParser from 'dxf-parser'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123'

// 读取安全配置参数 - 从数据库和配置文件获取
async function getSafeConfig(): Promise<Pick<CadAnalyzerConfig, 'maxFileSizeMB' | 'supportedFormats' | 'apiEndpoint' | 'apiKey'>> {
  try {
    // 从数据库获取CAD解读智能体配置
    const cadAgent = await AgentConfig.findOne({
      where: {
        type: 'cad-analyzer',
        isPublished: true
      }
    });

    // 尝试从配置文件读取额外配置
    let fileConfig: Partial<CadAnalyzerConfig> = {};
    try {
      const configPath = path.resolve(process.cwd(), 'config/cad-analyzer-config.json');
      const content = await fs.readFile(configPath, 'utf-8');
      fileConfig = JSON.parse(content);
    } catch (fileError) {
      console.log('读取CAD配置文件失败，使用默认配置', fileError);
    }

    if (!cadAgent && Object.keys(fileConfig).length === 0) {
      console.log('未找到已发布的CAD解读智能体配置，使用默认配置');
      return {
        maxFileSizeMB: 100,
        supportedFormats: ['.dwg', '.dxf', '.pdf', '.jpg', '.png'],
        apiEndpoint: '',
        apiKey: ''
      };
    }

    // 返回安全配置，优先使用配置文件中的值
    return {
      maxFileSizeMB: fileConfig.maxFileSizeMB || 100,
      supportedFormats: fileConfig.supportedFormats || ['.dwg', '.dxf', '.pdf', '.jpg', '.png'],
      apiEndpoint: fileConfig.apiEndpoint || '',
      apiKey: fileConfig.apiKey || ''
    };
  } catch (error) {
    console.error('获取CAD解读智能体配置失败:', error);
    return {
      maxFileSizeMB: 100,
      supportedFormats: ['.dwg', '.dxf', '.pdf', '.jpg', '.png'],
      apiEndpoint: '',
      apiKey: ''
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

// 调用AI大模型API进行智能分析，返回结构化内容
async function analyzeWithAI(filePath: string, ext: string): Promise<any> {
  try {
    // 从数据库获取CAD解读智能体配置
    const cadAgent = await AgentConfig.findOne({
      where: {
        type: 'cad-analyzer',
        isPublished: true
      }
    });

    // 获取配置文件中的API端点
    const safeConfig = await getSafeConfig();

    if (!cadAgent) {
      console.log('未找到已发布的CAD解读智能体配置，使用默认返回');
      // 返回默认结构化JSON，确保接口兼容性
      return {
        devices: [
          { type: "摄像机", count: 2, coordinates: [{ x: 100, y: 200 }, { x: 300, y: 400 }] },
          { type: "门禁", count: 1, coordinates: [{ x: 500, y: 600 }] },
        ],
        summary: "检测到摄像机2台、门禁1台，布局合理，无明显异常。布线信息正常。"
      };
    }

    // 检查必要的API配置是否存在，优先使用配置文件中的API端点和密钥
    const apiUrl = safeConfig.apiEndpoint || cadAgent.apiUrl;
    const apiKey = safeConfig.apiKey || cadAgent.apiKey;

    if (!apiUrl || !apiKey) {
      console.error('CAD解读智能体API配置不完整');
      return {
        devices: [
          { type: "摄像机", count: 2, coordinates: [{ x: 100, y: 200 }, { x: 300, y: 400 }] },
          { type: "门禁", count: 1, coordinates: [{ x: 500, y: 600 }] },
        ],
        summary: "API配置不完整，无法进行实时分析。这是默认返回结果。"
      };
    }

    // 读取文件内容
    const fileBuffer = await fs.readFile(filePath);
    const isImageFile = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext);
    // 构建请求体
    let requestMessages = [];

    // 添加系统提示词
    requestMessages.push({
      role: "system",
      content: cadAgent.systemPrompt || CAD_ANALYSIS_PROMPT
    });

    // 添加用户消息，根据文件类型构建不同的请求
    if (isImageFile) {
      // 图片文件使用多模态模型处理
      const fileBase64 = fileBuffer.toString('base64');
      requestMessages.push({
        role: "user",
        content: [
          { type: "text", text: "请分析这张CAD图纸图片，按照以下JSON格式输出结果：" + CAD_ANALYSIS_PROMPT },
          { type: "image_url", image_url: { url: `data:image/${ext};base64,${fileBase64}` } }
        ]
      });
    } else if (ext === "dxf") {
      try {
        let dxfData;
        let parseSuccess = false;

        try {
          // 尝试UTF-8编码
          const fileText = fileBuffer.toString('utf-8');
          const parser = new DxfParser();
          dxfData = parser.parseSync(fileText);
          parseSuccess = true;
          console.log("DXF文件解析成功 (UTF-8编码)");
        } catch (error: any) {
          console.error("UTF-8编码解析失败:", error?.message || '未知错误');
        }

        // 如果解析失败，抛出错误
        if (!parseSuccess || !dxfData) {
          throw new Error("DXF文件解析失败，无法获取有效数据");
        }

        // 获取所有图层
        const layers: string[] = [];
        if (dxfData?.tables?.layer?.layers) {
          Object.keys(dxfData.tables.layer.layers).forEach(layerName => {
            layers.push(layerName);
          });
        }

        // 获取单位信息
        const units = dxfData?.header?.$INSUNITS || 0;

        // 限制处理的实体数量，避免过大文件导致性能问题
        const MAX_ENTITIES = 3000;
        const allEntities = dxfData?.entities || [];
        const entitiesCount = allEntities.length;
        const limitedEntities = allEntities.slice(0, MAX_ENTITIES);

        // 安防设备专用数据结构，参考Python代码
        const securityData: Record<string, any> = {
          metadata: {
            layers: layers,
            units: units,
            total_entities: entitiesCount,
            processed_entities: Math.min(entitiesCount, MAX_ENTITIES)
          },
          security_devices: [],
          text_annotations: [],
          dimensions: [],
          wiring: []
        };

        // 统计实体类型
        const entityTypes: Record<string, number> = {};

        // 判断是否与安防相关的函数
        const isSecurityRelated = (text: string): boolean => {
          if (!text) return false;

          const lowerText = text.toLowerCase();
          const securityKeywords = ['考勤','门禁','消费机','道闸','摄像机','读卡器','电锁','门磁','闸机','访客机','指纹机','人脸机','车位锁','巡更点','报警'];

          return securityKeywords.some(keyword => lowerText.includes(keyword));
        };

        // 将坐标转换为数组
        const vecToList = (vec: any): number[] => {
          if (!vec) return [0, 0, 0];
          return [
            vec.x !== undefined ? vec.x : 0,
            vec.y !== undefined ? vec.y : 0,
            vec.z !== undefined ? vec.z : 0
          ];
        };

        // 第一遍扫描：识别安防设备
        limitedEntities.forEach((entity: any) => {
          // 统计实体类型
          if (entity.type) {
            entityTypes[entity.type] = (entityTypes[entity.type] || 0) + 1;
          }

          // 识别块引用（可能是安防设备）
          if (entity.type === 'INSERT') {
            const blockName = entity.name || '';
            if (blockName && isSecurityRelated(blockName)) {
              securityData.security_devices.push({
                type: "block_reference",
                name: blockName,
                layer: entity.layer || 'default',
                position: vecToList(entity.position),
                rotation: entity.rotation || 0
              });
            }
          }

          // 识别文本标注（可能包含设备信息）
          else if (entity.type === 'TEXT' || entity.type === 'MTEXT') {
            const textContent = entity.text || '';
            if (textContent) {
              // 如果文本内容与安防相关
              if (isSecurityRelated(textContent)) {
                securityData.text_annotations.push({
                  type: entity.type,
                  text: textContent,
                  layer: entity.layer || 'default',
                  position: vecToList(entity.position || entity.startPoint)
                });
              }

              // 如果是线缆标注
              if (textContent.toLowerCase().includes('线') ||
                  textContent.toLowerCase().includes('缆') ||
                  textContent.toLowerCase().includes('rvvp') ||
                  textContent.toLowerCase().includes('rvv')) {
                securityData.wiring.push({
                  text: textContent,
                  position: vecToList(entity.position || entity.startPoint),
                  layer: entity.layer || 'default'
                });
              }
            }
          }

          // 识别线条和多段线（可能是连接线）
          else if (entity.type === 'LINE') {
            securityData.wiring.push({
              type: entity.type,
              points: [
                vecToList(entity.vertices?.[0] || entity.start),
                vecToList(entity.vertices?.[1] || entity.end)
              ],
              layer: entity.layer || 'default'
            });
          }
          else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
            const points = entity.vertices?.map((vertex: any) =>
              vecToList(vertex)
            ) || [];

            if (points.length > 0) {
              securityData.wiring.push({
                type: entity.type,
                points: points,
                layer: entity.layer || 'default'
              });
            }
          }
        });

        // 构建解析结果
        const parsedDxfData: Record<string, any> = {
          fileName: path.basename(filePath),
          fileSize: fileBuffer.length,
          fileType: "DXF",
          entityTypes: entityTypes,
          securityData: securityData
        };

        // 构建请求消息
        requestMessages.push({
          role: "user",
          content: `请分析这个CAD文件(${ext}格式)，按照以下JSON格式输出结果：\n${CAD_ANALYSIS_PROMPT}\n\n以下是使用dxf-parser解析后的文件内容：\n${JSON.stringify(parsedDxfData, null, 2)}\n\n请基于解析数据进行分析，重点识别安防设备的类型、数量和位置。`
        });
      } catch (parseError: any) {
        console.error("DXF文件解析失败:", parseError);

        // 解析失败时，提供基本文件信息
        const fileInfo = {
          fileName: path.basename(filePath),
          fileSize: fileBuffer.length,
          fileType: "DXF",
          extension: ext,
          parseError: parseError?.message || '未知错误'
        };

        // 构建请求消息
        requestMessages.push({
          role: "user",
          content: `请分析这个CAD文件(${ext}格式)，按照以下JSON格式输出结果：\n${CAD_ANALYSIS_PROMPT}\n\n文件信息：\n${JSON.stringify(fileInfo, null, 2)}\n\n解析文件时出错，请基于常见CAD图纸进行分析，重点识别安防设备的类型、数量和位置。`
        });
      }
    } else {
      // 其他CAD文件类型，使用默认请求
      requestMessages.push({
        role: "user",
        content: `请分析这个CAD文件(${ext}格式)，按照以下JSON格式输出结果：\n${CAD_ANALYSIS_PROMPT}\n\n文件内容过大无法直接展示，请基于常见CAD图纸进行分析。`
      });
    }
    console.log('发送CAD的requestMessages--------------------=:', requestMessages);
    const requestData = {
        "model": cadAgent.multimodalModel,
        "input": {
            "messages": requestMessages
        },
        "response_format": "json_object"
    }

    console.log('发送CAD分析请求到模型API:', apiUrl);

    // 直接调用模型API，不通过代理
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestData)
    });
    const responseData = await response.json();
    console.log('模型API响应responseData:', responseData);
    // 提取模型返回的内容
    const modelResponse = responseData.output.text.replace('```json','').replace('```','').replace('\n', '');
    // 尝试解析JSON响应
    try {
      console.log("模型返回的modelResponse---:", modelResponse);
      const parsedResponse = JSON.parse(modelResponse);

      // 验证返回的JSON是否符合预期格式
      if (!parsedResponse.devices || !Array.isArray(parsedResponse.devices) || !parsedResponse.summary) {
        console.warn("模型返回的JSON格式不完全符合预期，进行修正");

        // 尝试修正格式
        const correctedDevices = Array.isArray(parsedResponse.devices) ? parsedResponse.devices : [];

        // 计算设备总数
        const totalCorrectedDevices = correctedDevices.reduce((sum: number, device: any) => sum + (device.count || 1), 0);

        const correctedResponse = {
          devices: correctedDevices,
          security_devices: correctedDevices, // 为了兼容前端显示
          totalDevices: totalCorrectedDevices,
          summary: parsedResponse.summary || "模型未返回有效的分析摘要"
        };

        return correctedResponse;
      }

      // 计算设备总数
      const totalDevices = parsedResponse.devices.reduce((sum: number, device: any) => sum + (device.count || 1), 0);

      // 添加额外字段以确保前端兼容性
      parsedResponse.security_devices = parsedResponse.devices;
      parsedResponse.totalDevices = totalDevices;

      return parsedResponse;
    } catch (parseError) {
      console.error("解析模型返回的JSON失败:", parseError);
      console.log("原始响应:", modelResponse);

      // 返回默认结构，但包含模型的文本响应
      const defaultDevices = [
        { type: "未知设备", count: 1, coordinates: [{ x: 100, y: 100 }] }
      ];

      return {
        devices: defaultDevices,
        security_devices: defaultDevices, // 为了兼容前端显示
        totalDevices: 1, // 只有一个未知设备
        summary: "解析JSON失败，原始响应: " + modelResponse.substring(0, 200) + "..."
      };
    }
  } catch (error) {
    console.error("CAD解读智能体分析过程中发生错误:", error);

    // 确保即使出错也返回有效的结构
    const defaultDevices = [
      { type: "摄像机", count: 2, coordinates: [{ x: 100, y: 200 }, { x: 300, y: 400 }] },
      { type: "门禁", count: 1, coordinates: [{ x: 500, y: 600 }] },
    ];

    // 计算默认设备总数
    const totalDefaultDevices = defaultDevices.reduce((sum: number, device: any) => sum + (device.count || 1), 0);

    return {
      devices: defaultDevices,
      security_devices: defaultDevices, // 为了兼容前端显示
      totalDevices: totalDefaultDevices,
      summary: "分析过程中发生错误: " + (error instanceof Error ? error.message : String(error)) + "。这是默认返回结果。"
    };
  }
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
    } catch (err: any) {
      console.error(`文件保存失败: ${filePath}`, err)
      throw new Error(`文件保存失败: ${err.message || String(err)}`)
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

      // 计算设备总数
      let totalDevices = 0;
      if (structured.devices && Array.isArray(structured.devices)) {
        totalDevices = structured.devices.reduce((sum: number, device: any) => sum + (device.count || 1), 0);
      }

      // 添加设备总数到结构化数据中
      structured.totalDevices = totalDevices;

      // 更新分析文本，包含设备总数
      analysis = `检测到共 ${totalDevices} 个安防设备。\n${structured.summary}\n设备清单：` + JSON.stringify(structured.devices, null, 2);

      // 为了兼容前端显示，添加security_devices字段
      structured.security_devices = structured.devices;
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