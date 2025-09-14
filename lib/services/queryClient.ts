/**
 * TanStack Query 客户端配置
 * 用于管理服务端状态和缓存
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * 创建 QueryClient 实例
 * 配置默认选项和缓存策略
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据新鲜度配置
      staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
      cacheTime: 10 * 60 * 1000, // 10分钟后清理缓存

      // 重试配置
      retry: (failureCount, error) => {
        // 网络错误重试3次
        if (error instanceof Error && error.message.includes('network')) {
          return failureCount < 3;
        }
        // 其他错误重试1次
        return failureCount < 1;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

      // 窗口焦点配置
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,

      // 错误处理
      throwOnError: false,

      // 网络模式
      networkMode: 'online',
    },
    mutations: {
      // 变更重试配置
      retry: 1,
      retryDelay: 1000,

      // 错误处理
      throwOnError: false,

      // 网络模式
      networkMode: 'online',
    },
  },
});

/**
 * 查询键工厂
 * 统一管理查询键，避免键冲突
 */
export const queryKeys = {
  // 智能体相关
  agents: {
    all: ['agents'] as const,
    lists: () => [...queryKeys.agents.all, 'list'] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.agents.lists(), { filters }] as const,
    details: () => [...queryKeys.agents.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.agents.details(), id] as const,
  },

  // 用户相关
  users: {
    all: ['users'] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
    settings: () => [...queryKeys.users.all, 'settings'] as const,
  },

  // 聊天相关
  chats: {
    all: ['chats'] as const,
    lists: () => [...queryKeys.chats.all, 'list'] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.chats.lists(), { filters }] as const,
    details: () => [...queryKeys.chats.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.chats.details(), id] as const,
    messages: (chatId: string) =>
      [...queryKeys.chats.detail(chatId), 'messages'] as const,
  },

  // 文件相关
  files: {
    all: ['files'] as const,
    upload: () => [...queryKeys.files.all, 'upload'] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.files.all, 'list', { filters }] as const,
  },

  // 配置相关
  config: {
    all: ['config'] as const,
    app: () => [...queryKeys.config.all, 'app'] as const,
    agents: () => [...queryKeys.config.all, 'agents'] as const,
    global: () => [...queryKeys.config.all, 'global'] as const,
  },
} as const;

/**
 * 查询配置预设
 * 常用查询配置的预设值
 */
export const queryConfigs = {
  // 智能体列表查询
  agentsList: {
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 10 * 60 * 1000, // 10分钟
    refetchOnWindowFocus: false,
  },

  // 智能体详情查询
  agentDetail: {
    staleTime: 10 * 60 * 1000, // 10分钟
    cacheTime: 30 * 60 * 1000, // 30分钟
    refetchOnWindowFocus: false,
  },

  // 聊天消息查询
  chatMessages: {
    staleTime: 1 * 60 * 1000, // 1分钟
    cacheTime: 5 * 60 * 1000, // 5分钟
    refetchOnWindowFocus: false,
  },

  // 用户配置查询
  userConfig: {
    staleTime: 15 * 60 * 1000, // 15分钟
    cacheTime: 60 * 60 * 1000, // 1小时
    refetchOnWindowFocus: false,
  },

  // 实时数据查询
  realtime: {
    staleTime: 0, // 立即过期
    cacheTime: 1 * 60 * 1000, // 1分钟
    refetchInterval: 30 * 1000, // 30秒轮询
    refetchOnWindowFocus: true,
  },
} as const;

/**
 * 缓存工具函数
 */
export const cacheUtils = {
  /**
   * 清理所有缓存
   */
  clearAll: () => {
    queryClient.clear();
  },

  /**
   * 清理特定查询缓存
   */
  clearQuery: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey });
  },

  /**
   * 清理查询模式缓存
   */
  clearQueries: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey });
  },

  /**
   * 使查询失效
   */
  invalidateQuery: (queryKey: readonly unknown[]) => {
    queryClient.invalidateQueries({ queryKey });
  },

  /**
   * 使查询模式失效
   */
  invalidateQueries: (queryKey: readonly unknown[]) => {
    queryClient.invalidateQueries({ queryKey });
  },

  /**
   * 预取查询数据
   */
  prefetchQuery: async (
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>,
    options?: any
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...options,
    });
  },

  /**
   * 获取查询数据
   */
  getQueryData: (queryKey: readonly unknown[]) => {
    return queryClient.getQueryData(queryKey);
  },

  /**
   * 设置查询数据
   */
  setQueryData: (queryKey: readonly unknown[], data: any) => {
    queryClient.setQueryData(queryKey, data);
  },
};

/**
 * 错误处理工具
 */
export const errorUtils = {
  /**
   * 检查是否为网络错误
   */
  isNetworkError: (error: any): boolean => {
    return (
      error?.message?.includes('network') ||
      error?.message?.includes('fetch') ||
      error?.code === 'NETWORK_ERROR'
    );
  },

  /**
   * 检查是否为认证错误
   */
  isAuthError: (error: any): boolean => {
    return error?.status === 401 || error?.code === 'UNAUTHORIZED';
  },

  /**
   * 检查是否为权限错误
   */
  isPermissionError: (error: any): boolean => {
    return error?.status === 403 || error?.code === 'FORBIDDEN';
  },

  /**
   * 获取错误消息
   */
  getErrorMessage: (error: any): string => {
    if (error?.message) {
      return error.message;
    }
    if (error?.error) {
      return error.error;
    }
    return '未知错误';
  },
};

/**
 * 开发环境调试工具
 */
if (process.env.NODE_ENV === 'development') {
  // 全局暴露 queryClient 用于调试
  (window as any).__QUERY_CLIENT__ = queryClient;

  // 查询状态变化监听
  queryClient.getQueryCache().subscribe(event => {
    if (event.type === 'updated') {
      console.log('Query Updated:', event.query.queryKey, event.query.state);
    }
  });
}
