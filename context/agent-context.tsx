"use client"
import { createContext, useState, type ReactNode, useContext, useEffect, useCallback } from "react"
import type { Agent } from "../types/agent"
import { fetchAgents } from "@/lib/services/agent-service" // 用户端专用，如有管理端 context 需切换为 admin-agent-service
import { DEFAULT_AGENTS } from "@/config/default-agents" // 导入默认智能体配置

// AgentContextType 接口
interface AgentContextType {
  agents: Agent[]
  selectedAgent: Agent | null
  sidebarOpen: boolean
  historySidebarOpen: boolean
  selectAgent: (agent: Agent) => void
  toggleSidebar: () => void
  toggleHistorySidebar: () => void
  closeSidebars: () => void
  isLoading: boolean
  refreshAgents: () => Promise<void>
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化智能体（结合API和默认智能体）
  const fetchAgentList = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true)
    try {
      // 获取API返回的智能体列表
      const apiAgentList = await fetchAgents()
      console.log("API返回智能体数量:", apiAgentList.length, apiAgentList.map(a => a.name));

      // 合并默认智能体和API返回的智能体
      // 使用Map确保ID不重复，API返回的智能体优先级更高
      const agentMap = new Map<string, Agent>();

      // 先添加默认智能体
      DEFAULT_AGENTS.forEach(agent => {
        // 为默认智能体添加图标
        const agentWithIcon = {
          ...agent,
          icon: agent.type // 简单使用类型作为图标
        };
        agentMap.set(agent.id, agentWithIcon);
      });

      // 再添加API返回的智能体，会覆盖同ID的默认智能体
      apiAgentList.forEach(agent => {
        // 为API智能体添加图标
        const agentWithIcon = {
          ...agent,
          icon: agent.type // 简单使用类型作为图标
        };
        agentMap.set(agent.id, agentWithIcon);
      });

      // 转换回数组并按顺序排序
      const combinedAgentList = Array.from(agentMap.values())
        .sort((a, b) => (a.order || 100) - (b.order || 100));

      console.log("合并后智能体数量:", combinedAgentList.length, combinedAgentList.map(a => a.name));

      setAgents(combinedAgentList)
      if (combinedAgentList.length > 0 && !selectedAgent) setSelectedAgent(combinedAgentList[0])
    } catch (error) {
      console.error("获取智能体列表时出错:", error)

      // 出错时使用默认智能体
      const defaultAgentsWithIcons = DEFAULT_AGENTS.map(agent => ({
        ...agent,
        icon: agent.type
      }));

      console.log("使用默认智能体:", defaultAgentsWithIcons.length);
      setAgents(defaultAgentsWithIcons)
      if (defaultAgentsWithIcons.length > 0 && !selectedAgent) setSelectedAgent(defaultAgentsWithIcons[0])
    } finally {
      if (isInitialLoad) setIsLoading(false)
    }
  }, [selectedAgent])

  // 初始加载
  useEffect(() => {
    fetchAgentList(true)
  }, [fetchAgentList])

  // 定期刷新智能体列表（每30秒检查一次）
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAgentList(false)
    }, 30000) // 30秒

    return () => clearInterval(intervalId)
  }, [fetchAgentList])

  useEffect(() => {
    if (agents.length > 0 && (!selectedAgent || !agents.find(a => a.id === selectedAgent.id))) {
      setSelectedAgent(agents[0]);
    }
  }, [agents]);

  const selectAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const toggleHistorySidebar = useCallback(() => {
    setHistorySidebarOpen((prev) => !prev)
  }, [])

  const closeSidebars = useCallback(() => {
    setSidebarOpen(false)
    setHistorySidebarOpen(false)
  }, [])

  // 手动刷新智能体列表的方法
  const refreshAgents = useCallback(async () => {
    console.log("手动刷新智能体列表")
    await fetchAgentList(false)
  }, [fetchAgentList])

  const value = {
    agents,
    selectedAgent,
    sidebarOpen,
    historySidebarOpen,
    selectAgent,
    toggleSidebar,
    toggleHistorySidebar,
    closeSidebars,
    isLoading,
    refreshAgents,
  }

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (!context) {
    throw new Error("useAgent must be used within a AgentProvider")
  }
  return context
}
