import { Agent } from '../../types/agent';

const API_URL = '/api/admin/agent-config';

// 获取所有智能体（管理端）
export async function fetchAgents(): Promise<Agent[]> {
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    const result = await res.json();
    if (res.status === 403) {
      throw new Error('无权限，请重新登录管理员账号');
    }
    if (!res.ok || !result.success) {
      throw new Error(result.error || '获取智能体失败');
    }
    return result.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

// 新增智能体
export async function createAgent(agent: Partial<Agent>): Promise<Agent> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agent),
  });
  const result = await res.json();
  if (!res.ok || !result.success)
    throw new Error(result.error || '新增智能体失败');
  return result.data;
}

// 更新智能体
export async function updateAgent(agent: Partial<Agent>): Promise<Agent> {
  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agent),
  });
  const result = await res.json();
  if (!res.ok || !result.success)
    throw new Error(result.error || '更新智能体失败');
  return result.data;
}

// 删除智能体
export async function deleteAgent(id: string): Promise<void> {
  const res = await fetch(API_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  const result = await res.json();
  if (!res.ok || !result.success)
    throw new Error(result.error || '删除智能体失败');
}

// 获取智能体详情（管理端）
export async function fetchAgentById(id: string): Promise<Agent> {
  const url = `${API_URL}?id=${encodeURIComponent(id)}`;
  const res = await fetch(url, { cache: 'no-store' });
  const result = await res.json();
  if (!res.ok || !result.success)
    throw new Error(result.error || '获取智能体详情失败');
  return result.data;
}
