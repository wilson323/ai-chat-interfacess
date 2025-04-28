import { useCallback } from 'react';
import { AgentType } from './useAgentData';

const LOCAL_CACHE_KEY = 'fastgpt_chat_history_cache';
const CACHE_EXPIRE_MS = 1000 * 60 * 60 * 24; // 24小时

/**
 * useChatHistory
 * fastgpt 智能体历史记录通过 localStorage 缓存最近会话，断网/刷新后自动失效或定期清理
 * 自研类型不缓存
 */
export function useChatHistory() {
  // 获取缓存
  const getCache = useCallback((agentId: string, userId: number) => {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      const key = `${agentId}_${userId}`;
      if (data[key] && Date.now() - data[key].ts < CACHE_EXPIRE_MS) {
        return data[key].history;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // 设置缓存
  const setCache = useCallback((agentId: string, userId: number, history: any) => {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    let data: { [key: string]: { history: any; ts: number } } = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }
    const key = `${agentId}_${userId}`;
    data[key] = { history, ts: Date.now() };
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));
  }, []);

  // 清理过期缓存
  const clearExpired = useCallback(() => {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return;
    try {
      const data: { [key: string]: { history: any; ts: number } } = JSON.parse(raw);
      const now = Date.now();
      Object.keys(data).forEach(key => {
        if (now - data[key].ts > CACHE_EXPIRE_MS) {
          delete data[key];
        }
      });
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));
    } catch {}
  }, []);

  return { getCache, setCache, clearExpired };
} 