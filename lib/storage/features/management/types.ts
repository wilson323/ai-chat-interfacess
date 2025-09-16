/**
 * 自定义智能体管理相关类型定义
 * 用于处理智能体数据的类型安全转换
 */

import { AgentConfigAttributes } from '../../../db/models/agent-config';

/**
 * 自定义智能体数据接口
 * 用于业务逻辑层的智能体数据表示
 */
export interface CustomAgentData {
    /** 智能体唯一标识 */
    id: number;
    /** 智能体名称 */
    name: string;
    /** 智能体类型：fastgpt | cad-analyzer | image-editor | ... */
    type: string;
    /** API密钥（加密存储） */
    apiKey: string;
    /** 应用ID */
    appId: string;
    /** API端点URL */
    apiUrl?: string;
    /** 系统提示词 */
    systemPrompt: string;
    /** 温度参数 */
    temperature: number;
    /** 最大token数 */
    maxTokens: number;
    /** 多模态模型名称 */
    multimodalModel?: string;
    /** 是否发布 */
    isPublished: boolean;
    /** 更新时间 */
    updatedAt?: Date;
    /** 描述信息 */
    description?: string;
    /** 排序权重 */
    order: number;
    /** 是否支持流式输出 */
    supportsStream: boolean;
    /** 是否支持详细输出 */
    supportsDetail: boolean;
    /** 全局变量配置（JSON字符串） */
    globalVariables?: string;
    /** 欢迎语 */
    welcomeText?: string;
}

/**
 * 创建自定义智能体数据
 */
export interface CreateCustomAgentData extends Omit<CustomAgentData, 'id' | 'updatedAt'> { }

/**
 * 更新自定义智能体数据
 */
export interface UpdateCustomAgentData extends Partial<Omit<CustomAgentData, 'id'>> { }

/**
 * 将数据库模型转换为业务逻辑层数据
 * @param agent 数据库模型实例
 * @returns 业务逻辑层智能体数据
 */
export function fromDatabaseModel(agent: AgentConfigAttributes): CustomAgentData {
    return {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        apiKey: agent.apiKey,
        appId: agent.appId,
        apiUrl: agent.apiUrl,
        systemPrompt: agent.systemPrompt,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        multimodalModel: agent.multimodalModel,
        isPublished: agent.isPublished,
        updatedAt: agent.updatedAt,
        description: agent.description,
        order: agent.order,
        supportsStream: agent.supportsStream,
        supportsDetail: agent.supportsDetail,
        globalVariables: agent.globalVariables,
        welcomeText: agent.welcomeText,
    };
}

/**
 * 将业务逻辑层数据转换为数据库模型属性
 * @param data 业务逻辑层智能体数据
 * @returns 数据库模型属性
 */
export function toDatabaseModel(data: Partial<CustomAgentData>): Partial<AgentConfigAttributes> {
    return {
        name: data.name,
        type: data.type,
        apiKey: data.apiKey,
        appId: data.appId,
        apiUrl: data.apiUrl,
        systemPrompt: data.systemPrompt,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        multimodalModel: data.multimodalModel,
        isPublished: data.isPublished,
        description: data.description,
        order: data.order,
        supportsStream: data.supportsStream,
        supportsDetail: data.supportsDetail,
        globalVariables: data.globalVariables,
        welcomeText: data.welcomeText,
    };
}
