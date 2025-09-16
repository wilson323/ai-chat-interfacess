/**
 * 智能体相关服务状态管理
 * 使用 TanStack Query 管理智能体的服务端状态
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  queryKeys,
  queryConfigs,
  cacheUtils,
  errorUtils,
} from '../services/queryClient';
import {
  fetchAgents,
} from '../services/admin-agent-service';
import { logger } from '../utils/logger';
import type { Agent } from '../../types';

/**
 * 获取智能体列表
 */
export const useAgents = (filters?: Record<string, unknown>) => {
  const result = useQuery<Agent[], Error>({
    queryKey: queryKeys.agents.list(filters || {}),
    queryFn: () => fetchAgents(),
    ...queryConfigs.agentsList,
  });
  if (result.error) {
    logger.error('获取智能体列表失败:', errorUtils.getErrorMessage(result.error));
  }
  return result;
};

/**
 * 获取智能体详情
 */
export const useAgent = (id: string) => {
  const result = useQuery<Agent, Error>({
    queryKey: queryKeys.agents.detail(id),
    queryFn: () => fetchAgents().then(agents => agents.find(agent => agent.id === id) || ({} as Agent)),
    ...queryConfigs.agentDetail,
    enabled: !!id,
  });
  if (result.error) {
    logger.error('获取智能体详情失败:', errorUtils.getErrorMessage(result.error));
  }
  return result;
};

/**
 * 创建智能体
 */
export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<Agent, Error, Partial<Agent>>({
    mutationFn: async (data: Partial<Agent>) => {
      // 模拟创建智能体
      const newAgent: Agent = {
        id: Date.now().toString(),
        name: data.name || '新智能体',
        description: data.description || '',
        type: data.type || 'fastgpt',
        apiKey: data.apiKey || '',
        appId: data.appId || '',
        apiUrl: data.apiUrl || '',
        systemPrompt: data.systemPrompt || '',
        temperature: data.temperature || 0.7,
        maxTokens: data.maxTokens || 2000,
        multimodalModel: data.multimodalModel || '',
        isPublished: data.isPublished || false,
        order: data.order || 0,
        supportsStream: data.supportsStream || true,
        supportsDetail: data.supportsDetail || true,
        isActive: data.isActive || true,
        config: data.config || {
          version: '1.0.0',
          settings: { timeout: 30000, retryCount: 3, cacheEnabled: true },
          features: { streaming: true, detail: true },
          limits: { maxTokens: 2000, maxRequests: 1000 }
        }
        // createdAt 和 updatedAt 字段在 Agent 接口中不存在
      };
      return newAgent;
    },
    onSuccess: newAgent => {
      // 更新智能体列表缓存
      queryClient.setQueryData(
        queryKeys.agents.lists(),
        (oldData: Agent[] | undefined) => {
          if (!oldData) return [newAgent];
          return [...oldData, newAgent];
        }
      );

      // 使相关查询失效
      cacheUtils.invalidateQueries(queryKeys.agents.all);
    },
    onError: (error: Error) => {
      logger.error('创建智能体失败:', errorUtils.getErrorMessage(error));
    },
  });
};

/**
 * 更新智能体
 */
export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<Agent, Error, { id: string; status?: string } | Partial<Agent>>({
    mutationFn: async (_data: { id: string; status?: string } | Partial<Agent>) => {
      // 临时实现，需要实际的更新函数
      throw new Error('updateAgent function not implemented');
    },
    onSuccess: (updatedAgent: Agent) => {
      // 更新智能体列表缓存
      queryClient.setQueryData(
        queryKeys.agents.lists(),
        (oldData: Agent[] | undefined) => {
          if (!oldData) return [updatedAgent];
          return oldData.map(agent =>
            agent.id === updatedAgent.id ? updatedAgent : agent
          );
        }
      );

      // 更新智能体详情缓存
      queryClient.setQueryData(queryKeys.agents.detail(updatedAgent.id), updatedAgent);

      // 使相关查询失效
      cacheUtils.invalidateQueries(queryKeys.agents.all);
    },
    onError: (error: Error) => {
      logger.error('更新智能体失败:', errorUtils.getErrorMessage(error));
    },
  });
};

/**
 * 删除智能体
 */
export const useDeleteAgent = () => {

  return useMutation<string, Error, string>({
    mutationFn: async () => {
      // 临时实现，需要实际的删除函数
      throw new Error('deleteAgent function not implemented');
    },
    onSuccess: () => {
      // TODO: 实现删除成功后的缓存更新逻辑
      console.log('Agent deleted successfully');

      // 清理智能体列表缓存
      cacheUtils.clearQuery(queryKeys.agents.lists());

      // 使相关查询失效
      cacheUtils.invalidateQueries(queryKeys.agents.all);
    },
    onError: (error: Error) => {
      logger.error('删除智能体失败:', errorUtils.getErrorMessage(error));
    },
  });
};

/**
 * 智能体管理组合 Hook
 * 提供完整的智能体管理功能
 */
export const useAgentManagement = () => {
  // const _queryClient = useQueryClient(); // 暂时注释掉，未使用

  // 获取智能体列表
  const { data, isLoading, error, refetch } = useAgents();
  const agents = data || [];

  // 创建智能体
  const createMutation = useCreateAgent();

  // 更新智能体
  const updateMutation = useUpdateAgent();

  // 删除智能体
  const deleteMutation = useDeleteAgent();

  /**
   * 刷新智能体列表
   */
  const refreshAgents = () => {
    refetch();
  };

  /**
   * 预取智能体详情
   */
  const prefetchAgent = async (id: string) => {
    await cacheUtils.prefetchQuery(
      queryKeys.agents.detail(id),
      () => fetchAgents().then(agents => agents.find(agent => agent.id === id) || ({} as Agent)),
      queryConfigs.agentDetail
    );
  };

  /**
   * 批量操作
   */
  const batchOperations = {
    /**
     * 批量删除智能体
     */
    deleteMultiple: async (ids: string[]) => {
      const promises = ids.map(id => deleteMutation.mutateAsync(id));
      await Promise.all(promises);
    },

    /**
     * 批量更新智能体状态
     */
    updateMultipleStatus: async (ids: string[], status: string) => {
      const promises = ids.map(id =>
        updateMutation.mutateAsync({ id, status })
      );
      await Promise.all(promises);
    },
  };

  return {
    // 数据
    agents: agents || [],
    isLoading,
    error,

    // 操作
    refreshAgents,
    prefetchAgent,

    // 变更操作
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,

    // 变更状态
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // 变更错误
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,

    // 批量操作
    batchOperations,
  };
};

/**
 * 智能体选择器 Hook
 * 用于选择和管理当前选中的智能体
 */
export const useAgentSelector = () => {
  const { data: agents, isLoading } = useAgents();

  /**
   * 根据ID获取智能体
   */
  const getAgentById = (id: string) => {
    return agents?.find((agent: Agent) => agent.id === id);
  };

  /**
   * 根据类型获取智能体列表
   */
  const getAgentsByType = (type: string) => {
    return agents?.filter((agent: Agent) => agent.type === type) || [];
  };

  /**
   * 获取已发布的智能体
   */
  const getPublishedAgents = () => {
    return agents?.filter((agent: Agent) => agent.isPublished) || [];
  };

  /**
   * 搜索智能体
   */
  const searchAgents = (query: string) => {
    if (!query) return agents || [];
    return (
      agents?.filter(
        (agent: Agent) =>
          agent.name.toLowerCase().includes(query.toLowerCase()) ||
          agent.description?.toLowerCase().includes(query.toLowerCase())
      ) || []
    );
  };

  return {
    agents: agents || [],
    isLoading,
    getAgentById,
    getAgentsByType,
    getPublishedAgents,
    searchAgents,
  };
};
