import { useState, useEffect } from "react"

interface UseRemoteChatHistoryParams {
  userId?: string
  agentId?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export function useRemoteChatHistory({ userId, agentId, keyword, page = 1, pageSize = 20 }: UseRemoteChatHistoryParams) {
  const [data, setData] = useState<{ total: number; list: any[]; loading: boolean; error: any }>({ total: 0, list: [], loading: true, error: null })

  useEffect(() => {
    setData(d => ({ ...d, loading: true }))
    const params = new URLSearchParams()
    if (userId) params.append("userId", userId)
    if (agentId) params.append("agentId", agentId)
    if (keyword) params.append("keyword", keyword)
    params.append("page", String(page))
    params.append("pageSize", String(pageSize))

    fetch(`/api/chat-history?${params.toString()}`)
      .then(res => res.json())
      .then(res => setData({ total: res.total, list: res.list, loading: false, error: null }))
      .catch(e => setData(d => ({ ...d, loading: false, error: e })))
  }, [userId, agentId, keyword, page, pageSize])

  return data
} 