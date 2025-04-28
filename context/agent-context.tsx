"use client"
import { createContext, useState, type ReactNode, useContext, useEffect, useCallback } from "react"
import type { Agent } from "../types/agent"
import { fetchAgents } from "@/lib/services/agent-service" // 用户端专用，如有管理端 context 需切换为 admin-agent-service

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
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化智能体（只用API，不用本地store）
  useEffect(() => {
    async function initialize() {
      setIsLoading(true)
      try {
        const agentList = await fetchAgents()
        console.log("前端拉取到 agents 数量:", agentList.length, agentList.map(a => a.name));
        setAgents(agentList)
        if (agentList.length > 0) setSelectedAgent(agentList[0])
      } catch (error) {
        console.error("初始化智能体时出错:", error)
      } finally {
        setIsLoading(false)
      }
    }
    initialize()
  }, [])

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
