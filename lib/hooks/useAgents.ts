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
} from '@/lib/services/queryClient';
import {
  fetchAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  getAgentById,
} from '@/lib/services/agent-service';
import type { Agent } from '@/types';

/**
 * 获取智能体列表
 */
export const useAgents = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.agents.list(filters || {}),
    queryFn: () => fetchAgents(filters),
    ...queryConfigs.agentsList,
    onError: error => {
      console.error('获取智能体列表失败:', errorUtils.getErrorMessage(error));
    },
  });
};

/**
 * 获取智能体详情
 */
export const useAgent = (id: string) => {
  return useQuery({
    queryKey: queryKeys.agents.detail(id),
    queryFn: () => getAgentById(id),
    ...queryConfigs.agentDetail,
    enabled: !!id,
    onError: error => {
      console.error('获取智能体详情失败:', errorUtils.getErrorMessage(error));
    },
  });
};

/**
 * 创建智能体
 */
export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAgent,
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
    onError: error => {
      console.error('创建智能体失败:', errorUtils.getErrorMessage(error));
    },
  });
};

/**
 * 更新智能体
 */
export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAgent,
    onSuccess: updatedAgent => {
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
      queryClient.setQueryData(
        queryKeys.agents.detail(updatedAgent.id),
        updatedAgent
      );

      // 使相关查询失效
      cacheUtils.invalidateQueries(queryKeys.agents.all);
    },
    onError: error => {
      console.error('更新智能体失败:', errorUtils.getErrorMessage(error));
    },
  });
};

/**
 * 删除智能体
 */
export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: (_, deletedId) => {
      // 从智能体列表缓存中移除
      queryClient.setQueryData(
        queryKeys.agents.lists(),
        (oldData: Agent[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter(agent => agent.id !== deletedId);
        }
      );

      // 清理智能体详情缓存
      cacheUtils.clearQuery(queryKeys.agents.detail(deletedId));

      // 使相关查询失效
      cacheUtils.invalidateQueries(queryKeys.agents.all);
    },
    onError: error => {
      console.error('删除智能体失败:', errorUtils.getErrorMessage(error));
    },
  });
};

/**
 * 智能体管理组合 Hook
 * 提供完整的智能体管理功能
 */
export const useAgentManagement = () => {
  const queryClient = useQueryClient();

  // 获取智能体列表
  const { data: agents, isLoading, error, refetch } = useAgents();

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
      () => getAgentById(id),
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
  const { agents, isLoading } = useAgents();

  /**
   * 根据ID获取智能体
   */
  const getAgentById = (id: string) => {
    return agents?.find(agent => agent.id === id);
  };

  /**
   * 根据类型获取智能体列表
   */
  const getAgentsByType = (type: string) => {
    return agents?.filter(agent => agent.type === type) || [];
  };

  /**
   * 获取已发布的智能体
   */
  const getPublishedAgents = () => {
    return agents?.filter(agent => agent.isPublished) || [];
  };

  /**
   * 搜索智能体
   */
  const searchAgents = (query: string) => {
    if (!query) return agents || [];
    return (
      agents?.filter(
        agent =>
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
