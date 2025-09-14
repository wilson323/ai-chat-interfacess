import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { CadAnalyzerConfig } from '@/types/api/agent-config/cad-analyzer';
import AgentConfig from '@/lib/db/models/agent-config';

const CONFIG_PATH = path.resolve(
  process.cwd(),
  'config/cad-analyzer-config.json'
);

// 管理端权限校验 - 与其他管理API保持一致
function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get('adminToken')?.value;
  if (!token) return false;
  // 只检查token是否存在，不验证内容
  return true;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }
  try {
    // 创建默认配置
    const defaultConfig: CadAnalyzerConfig = {
      enabled: false,
      models: [],
      defaultModel: '',
      maxFileSizeMB: 10,
      supportedFormats: ['.dwg', '.dxf', '.pdf', '.jpg', '.png'],
      analysisParams: {
        precision: 'medium',
        timeoutSec: 60,
        maxPages: 10,
      },
      historyRetentionDays: 30,
      description: '',
      apiEndpoint: '',
      apiKey: '',
    };

    // 尝试从数据库读取CAD智能体配置
    let dbConfig = null;
    try {
      const cadAgent = await AgentConfig.findOne({
        where: { type: 'cad-analyzer' },
      });

      if (cadAgent) {
        console.log(`从数据库读取到CAD智能体配置，ID: ${cadAgent.id}`);
        // 从数据库配置更新默认配置的部分字段
        defaultConfig.enabled = cadAgent.isPublished;
        defaultConfig.defaultModel = cadAgent.multimodalModel || '';
        defaultConfig.description = cadAgent.description || '';
        defaultConfig.apiEndpoint = cadAgent.apiUrl || '';
        defaultConfig.apiKey = cadAgent.apiKey || '';

        dbConfig = true;
      }
    } catch (dbError) {
      console.error('从数据库读取CAD智能体配置失败:', dbError);
      // 继续使用文件配置
    }

    // 检查配置文件是否存在
    let fileConfig = null;
    try {
      await fs.access(CONFIG_PATH);
      // 读取现有配置文件
      const content = await fs.readFile(CONFIG_PATH, 'utf-8');
      fileConfig = JSON.parse(content);
      console.log(`从文件读取到CAD智能体配置: ${CONFIG_PATH}`);
    } catch (accessError) {
      console.log(`配置文件不存在: ${CONFIG_PATH}`);
    }

    // 合并配置：优先使用文件配置，但确保数据库的关键字段被保留
    let finalConfig = { ...defaultConfig };

    if (fileConfig) {
      // 合并文件配置
      finalConfig = { ...finalConfig, ...fileConfig };
    }

    if (dbConfig) {
      // 确保数据库中的关键字段被保留
      finalConfig.enabled = defaultConfig.enabled;
      finalConfig.apiEndpoint = defaultConfig.apiEndpoint;
      finalConfig.apiKey = defaultConfig.apiKey;
      finalConfig.defaultModel = defaultConfig.defaultModel;
      finalConfig.description = defaultConfig.description;
    }

    // 如果配置文件不存在或内容与最终配置不同，则保存到文件
    if (
      !fileConfig ||
      JSON.stringify(fileConfig) !== JSON.stringify(finalConfig)
    ) {
      // 确保配置目录存在
      const configDir = path.dirname(CONFIG_PATH);
      await fs.mkdir(configDir, { recursive: true });

      // 保存最终配置到文件
      await fs.writeFile(
        CONFIG_PATH,
        JSON.stringify(finalConfig, null, 2),
        'utf-8'
      );
      console.log(`CAD智能体配置已更新到文件: ${CONFIG_PATH}`);
    }

    return NextResponse.json(finalConfig);
  } catch (e) {
    console.error('读取CAD智能体配置失败:', e);
    return NextResponse.json(
      { error: '读取配置失败', detail: String(e) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }
  try {
    const body = await req.json();

    // 确保配置目录存在
    const configDir = path.dirname(CONFIG_PATH);
    try {
      await fs.mkdir(configDir, { recursive: true });
      console.log(`确保配置目录存在: ${configDir}`);
    } catch (dirError) {
      console.error(`创建配置目录失败: ${configDir}`, dirError);
    }

    // 保存配置文件
    await fs.writeFile(CONFIG_PATH, JSON.stringify(body, null, 2), 'utf-8');
    console.log(`CAD智能体配置已保存到文件: ${CONFIG_PATH}`);

    // 同时保存到数据库
    try {
      // 查找现有的CAD智能体配置
      let cadAgent = await AgentConfig.findOne({
        where: { type: 'cad-analyzer' },
      });

      // 如果不存在，则创建新的配置
      if (!cadAgent) {
        console.log('数据库中不存在CAD智能体配置，创建新配置');
        cadAgent = await AgentConfig.create({
          name: 'CAD解读智能体',
          type: 'cad-analyzer',
          apiKey: body.apiKey || '',
          appId: '',
          apiUrl: body.apiEndpoint || '',
          systemPrompt:
            '你是一位专业的安防系统工程师和CAD图纸分析专家，能够分析CAD图纸并提供详细的安防设备分析报告。',
          temperature: 0.7,
          maxTokens: 4000,
          multimodalModel: body.defaultModel || 'qwen-vl-max',
          isPublished: body.enabled || false,
          description:
            body.description || '专业CAD图纸解析工具，识别安防设备布局',
          order: 100,
          supportsStream: true,
          supportsDetail: true,
        });
      } else {
        // 更新现有配置
        cadAgent.apiKey = body.apiKey || '';
        cadAgent.apiUrl = body.apiEndpoint || '';
        cadAgent.multimodalModel =
          body.defaultModel || cadAgent.multimodalModel;
        cadAgent.isPublished = body.enabled || false;
        cadAgent.description = body.description || cadAgent.description;

        // 保存更改
        await cadAgent.save();
      }

      console.log(`CAD智能体配置已同步到数据库，ID: ${cadAgent.id}`);
    } catch (dbError) {
      console.error('保存CAD智能体配置到数据库失败:', dbError);
      // 不中断流程，继续返回成功
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('保存CAD智能体配置失败:', e);
    return NextResponse.json(
      { error: '保存配置失败', detail: String(e) },
      { status: 500 }
    );
  }
}
