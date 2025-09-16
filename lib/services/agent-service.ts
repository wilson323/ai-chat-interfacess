import { Agent } from '../../types/agent';

const API_URL = '/api/agent-config';

// 用户端：仅获取公开智能体，异常处理更健壮
export async function fetchAgents(): Promise<Agent[]> {
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    const result = await res.json();
    if (!res.ok || !result.success)
      throw new Error(result.error || '获取智能体失败');
    return result.data;
  } catch (error) {
    // 统一抛出异常，便于前端捕获
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

// 彻底禁止用户端增删改操作
