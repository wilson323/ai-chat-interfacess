import { useCallback } from 'react';
import axios from 'axios';

interface FetchHistoryParams {
  agent: { type: string; appId: string; id: number };
  userId: number;
  page?: number;
  pageSize?: number;
}

export function useAgentData() {
  const fetchHistory = useCallback(
    async ({ agent, userId, page = 1, pageSize = 20 }: FetchHistoryParams) => {
      if (agent.type === 'cad-analyzer') {
        const res = await axios.get('/api/cad-analyzer/history', {
          params: { agentId: agent.id, userId, page, pageSize },
        });
        return res.data.data;
      }
      // ...可扩展其他类型
      return [];
    },
    []
  );
  return { fetchHistory };
}
