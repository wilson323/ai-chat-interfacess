// CAD/绘图等自研智能体专用存储管理模块
// 仅用于非会话型智能体的存储、配置、管理

import type { StorageStats } from '../../shared/types';
// Record is a built-in TypeScript utility type, no need to import
import { AgentConfig } from '../../../db/models/agent-config';
import { CadHistory } from '../../../db/models/cad-history';
import { ErrorHandler, InternalError } from '../../../utils/error-handler';
import { logger } from '../../../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { Op } from 'sequelize';
import { fromDatabaseModel } from './types';

/**
 * 自研智能体数据类型定义
 */
export interface CustomAgentData {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  fileData?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    analysisResult: string;
  }[];
}

/**
 * 获取自研智能体存储统计信息
 */
export async function getCustomAgentStorageStats(): Promise<StorageStats> {
  try {
    // 获取自研智能体配置
    const customAgents = await AgentConfig.findAll({
      where: {
        type: {
          [Op.not]: 'fastgpt',
        },
      },
    });

    // 计算数据库存储大小
    let totalSizeBytes = 0;
    let chatCount = 0;

    // 计算CAD历史记录大小
    const cadHistories = await CadHistory.findAll();
    for (const history of cadHistories) {
      totalSizeBytes += Buffer.byteLength(history.analysisResult, 'utf8');
      totalSizeBytes += Buffer.byteLength(history.fileName, 'utf8');
      totalSizeBytes += Buffer.byteLength(history.fileUrl, 'utf8');
      chatCount++;
    }

    // 计算文件系统存储大小
    const filePaths = [
      path.join(process.cwd(), 'public', 'cad-analyzer'),
      path.join(process.cwd(), 'public', 'image-edits'),
      path.join(process.cwd(), 'public', 'uploads'),
    ];

    for (const dirPath of filePaths) {
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const file of files) {
          if (file.isFile()) {
            const filePath = path.join(dirPath, file.name);
            try {
              const stats = fs.statSync(filePath);
              totalSizeBytes += stats.size;
            } catch (error) {
              logger.warn(`无法读取文件大小: ${filePath}`, error);
            }
          }
        }
      }
    }

    // 计算配置数据大小
    for (const agent of customAgents) {
      totalSizeBytes += Buffer.byteLength(
        JSON.stringify(agent.toJSON()),
        'utf8'
      );
    }

    const totalSizeMB = totalSizeBytes / (1024 * 1024);
    const maxSizeMB = 1000; // 1GB 最大存储限制
    const usagePercent = (totalSizeMB / maxSizeMB) * 100;

    return {
      totalSizeMB: Math.round(totalSizeMB * 100) / 100,
      maxSizeMB,
      usagePercent: Math.round(usagePercent * 100) / 100,
      chatCount,
    };
  } catch (error) {
    ErrorHandler.handle(error, {
      context: 'getCustomAgentStorageStats',
      operation: 'getCustomAgentStorageStats',
    });
    throw new InternalError('获取自研智能体存储统计失败', error as Error, {
      operation: 'getCustomAgentStorageStats',
    });
  }
}

/**
 * 清除所有自研智能体数据
 */
export async function clearAllCustomAgentData(): Promise<boolean> {
  try {
    // 清除数据库中的CAD历史记录
    await CadHistory.destroy({ where: {} });

    // 清除文件系统中的文件
    const filePaths = [
      path.join(process.cwd(), 'public', 'cad-analyzer'),
      path.join(process.cwd(), 'public', 'image-edits'),
      path.join(process.cwd(), 'public', 'uploads'),
    ];

    for (const dirPath of filePaths) {
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          try {
            fs.unlinkSync(filePath);
          } catch (error) {
            logger.warn(`删除文件失败: ${filePath}`, error);
          }
        }
      }
    }

    return true;
  } catch (error) {
    ErrorHandler.handle(error, {
      context: 'clearAllCustomAgentData',
      operation: 'clearAllCustomAgentData',
    });
    throw new InternalError('清除自研智能体数据失败', error as Error, {
      operation: 'clearAllCustomAgentData',
    });
  }
}

/**
 * 导出所有自研智能体数据
 */
export async function exportAllCustomAgentData(): Promise<CustomAgentData[]> {
  try {
    const customAgents = await AgentConfig.findAll({
      where: {
        type: {
          [Op.not]: 'fastgpt',
        },
      },
    });

    const exportData: CustomAgentData[] = [];

    for (const agent of customAgents) {
      // 获取该智能体的历史记录
      const histories = await CadHistory.findAll({
        where: { agentId: agent.id },
      });

      const fileData = histories.map(history => ({
        fileName: history.fileName,
        fileUrl: history.fileUrl,
        fileSize: Buffer.byteLength(history.analysisResult, 'utf8'),
        analysisResult: history.analysisResult,
      }));

      // 使用类型安全的转换函数
      const agentData = fromDatabaseModel(agent);
      exportData.push({
        id: agentData.id.toString(),
        name: agentData.name,
        type: agentData.type,
        config: {
          apiKey: agentData.apiKey,
          appId: agentData.appId,
          apiUrl: agentData.apiUrl,
          systemPrompt: agentData.systemPrompt,
          temperature: agentData.temperature,
          maxTokens: agentData.maxTokens,
          multimodalModel: agentData.multimodalModel,
          isPublished: agentData.isPublished,
          description: agentData.description,
          order: agentData.order,
          supportsStream: agentData.supportsStream,
          supportsDetail: agentData.supportsDetail,
          globalVariables: agentData.globalVariables,
          welcomeText: agentData.welcomeText,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        fileData,
      });
    }

    return exportData;
  } catch (error) {
    ErrorHandler.handle(error, {
      context: 'exportAllCustomAgentData',
      operation: 'exportAllCustomAgentData',
    });
    throw new InternalError('导出自研智能体数据失败', error as Error, {
      operation: 'exportAllCustomAgentData',
    });
  }
}

/**
 * 导入自研智能体数据
 */
export async function importCustomAgentData(
  data: CustomAgentData[]
): Promise<boolean> {
  try {
    for (const agentData of data) {
      // 检查智能体是否已存在
      const existingAgent = await AgentConfig.findOne({
        where: { name: agentData.name },
      });

      if (existingAgent) {
        logger.warn(`智能体 ${agentData.name} 已存在，跳过导入`);
        continue;
      }

      // 创建新的智能体配置
      const cfg = (agentData.config || {}) as Record<string, unknown>;
      const newAgent = await AgentConfig.create({
        name: agentData.name,
        type: agentData.type,
        apiKey: String(cfg.apiKey ?? ''),
        appId: String(cfg.appId ?? ''),
        apiUrl: cfg.apiUrl === undefined || cfg.apiUrl === null ? undefined : String(cfg.apiUrl),
        systemPrompt: String(cfg.systemPrompt ?? ''),
        temperature: Number(cfg.temperature ?? 0.8),
        maxTokens: Number(cfg.maxTokens ?? 2048),
        multimodalModel: cfg.multimodalModel === undefined || cfg.multimodalModel === null ? undefined : String(cfg.multimodalModel),
        isPublished: Boolean(cfg.isPublished ?? false),
        description: cfg.description === undefined || cfg.description === null ? undefined : String(cfg.description),
        order: Number(cfg.order ?? 0),
        supportsStream: Boolean(cfg.supportsStream ?? true),
        supportsDetail: Boolean(cfg.supportsDetail ?? false),
        globalVariables: cfg.globalVariables as unknown as string | undefined,
        welcomeText: cfg.welcomeText === undefined || cfg.welcomeText === null ? undefined : String(cfg.welcomeText),
      });

      // 导入文件数据
      if (agentData.fileData && agentData.fileData.length > 0) {
        for (const file of agentData.fileData) {
          await CadHistory.create({
            agentId: newAgent.id,
            userId: 1, // 默认用户ID，实际使用时应该从上下文获取
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            analysisResult: file.analysisResult,
          });
        }
      }
    }

    return true;
  } catch (error) {
    ErrorHandler.handle(error, {
      context: 'importCustomAgentData',
      operation: 'importCustomAgentData',
    });
    throw new InternalError('导入自研智能体数据失败', error as Error, {
      operation: 'importCustomAgentData',
    });
  }
}
