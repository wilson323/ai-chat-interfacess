"use client"
import { createContext, useState, type ReactNode, useContext, useEffect, useCallback } from "react"
import type { Agent, GlobalVariable } from "../types/agent"
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
  updateAgentConfig: (config: Partial<Agent>) => void
  // 全局变量相关
  showGlobalVariablesForm: boolean
  setShowGlobalVariablesForm: (show: boolean) => void
  globalVariables: Record<string, any>
  setGlobalVariables: (variables: Record<string, any>) => void
  checkRequiredVariables: (agent: Agent) => boolean
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // 全局变量相关状态
  const [showGlobalVariablesForm, setShowGlobalVariablesForm] = useState(false)
  const [globalVariables, setGlobalVariables] = useState<Record<string, any>>({})

  // 初始化智能体（只用API，不用本地store）
  useEffect(() => {
    async function initialize() {
      setIsLoading(true)
      try {
        const agentList = await fetchAgents()
        console.log("前端拉取到 agents 数量:", agentList.length, agentList.map(a => a.name));
        setAgents(agentList)
        // 初始化时直接设置第一个智能体，不触发全局变量检查
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

  // 检查智能体是否有必填的全局变量（用于判断是否需要弹出配置表单）
  const checkRequiredVariables = useCallback((agent: Agent): boolean => {
    if (agent.type !== 'fastgpt' || !agent.globalVariables) {
      return true // 非FastGPT智能体或无全局变量，直接通过
    }

    const requiredVars = agent.globalVariables.filter(v => v.required)
    if (requiredVars.length === 0) {
      return true // 无必填变量，直接通过
    }

    // 修改：每次切换智能体时都需要弹出配置表单（如果有必填变量）
    // 不再检查localStorage中的保存值，始终返回false以触发表单弹出
    return false
  }, [])

  const selectAgent = useCallback((agent: Agent) => {
    // 避免重复设置相同的智能体
    if (selectedAgent?.id === agent.id) {
      return
    }

    // 先设置智能体
    setSelectedAgent(agent)

    // 检查是否需要填写全局变量
    const needsVariables = !checkRequiredVariables(agent)

    if (needsVariables) {
      // 需要填写全局变量，显示表单
      // 同时加载已保存的变量值（如果有的话），用于表单预填充
      const savedValues = localStorage.getItem(`agent-variables-${agent.id}`)
      if (savedValues) {
        try {
          const parsed = JSON.parse(savedValues)
          setGlobalVariables(parsed)
        } catch {
          setGlobalVariables({})
        }
      } else {
        setGlobalVariables({})
      }
      setShowGlobalVariablesForm(true)
    } else {
      // 不需要填写全局变量的情况（非FastGPT或无必填变量）
      setGlobalVariables({})
    }
  }, [selectedAgent?.id, checkRequiredVariables])

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

  // 更新智能体配置
  const updateAgentConfig = useCallback((config: Partial<Agent>) => {
    if (!selectedAgent) return

    // 更新选中的智能体
    setSelectedAgent(prev => {
      if (!prev) return null

      const updated = {
        ...prev,
        ...config,
      }

      console.log("更新智能体配置:", updated)
      return updated
    })
  }, [selectedAgent])

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
    updateAgentConfig,
    // 全局变量相关
    showGlobalVariablesForm,
    setShowGlobalVariablesForm,
    globalVariables,
    setGlobalVariables,
    checkRequiredVariables,
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
