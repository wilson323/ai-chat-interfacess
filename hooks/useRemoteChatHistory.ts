import { useState, useEffect } from 'react';

interface UseRemoteChatHistoryParams {
  userId?: string;
  agentId?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export function useRemoteChatHistory({
  userId,
  agentId,
  keyword,
  page = 1,
  pageSize = 20,
}: UseRemoteChatHistoryParams) {
  const [data, setData] = useState<{
    total: number;
    list: any[];
    loading: boolean;
    error: any;
  }>({ total: 0, list: [], loading: true, error: null });

  useEffect(() => {
    // 检查当前是否在user界面
    const isUserInterface =
      typeof window !== 'undefined' &&
      window.location.pathname.includes('/user');

    // 如果是user界面，直接返回空数据，不请求服务器
    if (isUserInterface) {
      console.log('User interface detected, using local storage only');
      setData({ total: 0, list: [], loading: false, error: null });
      return;
    }

    // 如果不是user界面，正常请求服务器
    setData(d => ({ ...d, loading: true }));
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (agentId) params.append('agentId', agentId);
    if (keyword) params.append('keyword', keyword);
    params.append('page', String(page));
    params.append('pageSize', String(pageSize));

    fetch(`/api/chat-history?${params.toString()}`)
      .then(res => {
        // 检查响应状态
        if (!res.ok) {
          throw new Error(`服务器返回错误: ${res.status} ${res.statusText}`);
        }
        // 检查内容类型
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`非JSON响应: ${contentType}`);
        }
        return res.json();
      })
      .then(res => {
        // 检查响应数据结构
        if (!res || typeof res !== 'object') {
          throw new Error('响应数据格式无效');
        }
        // 设置默认值，防止undefined错误
        const total = res.total || 0;
        const list = Array.isArray(res.list) ? res.list : [];
        setData({ total, list, loading: false, error: null });
      })
      .catch(e => {
        console.error('获取聊天历史失败:', e);
        setData(d => ({ ...d, loading: false, error: e }));
      });
  }, [userId, agentId, keyword, page, pageSize]);

  return data;
}
