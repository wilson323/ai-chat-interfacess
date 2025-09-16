'use client';
import {
  createContext,
  useState,
  type ReactNode,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import type { Agent } from '../types/agent';
import type { GlobalVariable } from '../types/global-variable';
import { fetchAgents } from '../lib/services/agent-service'; // 用户端专用，如有管理端 context 需切换为 admin-agent-service
import { saveSelectedAgent, loadSelectedAgentId } from '../lib/storage/index';

// AgentContextType 接口
interface AgentContextType {
  agents: Agent[];
  selectedAgent: Agent | null;
  sidebarOpen: boolean;
  historySidebarOpen: boolean;
  selectAgent: (agent: Agent) => void;
  toggleSidebar: () => void;
  toggleHistorySidebar: () => void;
  closeSidebars: () => void;
  isLoading: boolean;
  updateAgentConfig: (config: Partial<Agent>) => void;
  // 全局变量相关
  showGlobalVariablesForm: boolean;
  setShowGlobalVariablesForm: (show: boolean) => void;
  globalVariables: GlobalVariable[];
  setGlobalVariables: (variables: GlobalVariable[]) => void;
  checkRequiredVariables: (agent: Agent) => boolean;
  // 请求中断相关
  abortCurrentRequest: () => void;
  setAbortController: (controller: AbortController | null) => void;
  isRequestActive: boolean;
  // 设置相关
  onSettingsClick: () => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // 全局变量相关状态
  const [showGlobalVariablesForm, setShowGlobalVariablesForm] = useState(false);
  const [globalVariables, setGlobalVariables] = useState<GlobalVariable[]>([]);

  // 请求中断相关状态
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isRequestActive, setIsRequestActive] = useState(false);

  // 页面刷新后参数检查标志位
  const [hasCheckedAfterRefresh, setHasCheckedAfterRefresh] = useState(false);

  // 初始化智能体（只用API，不用本地store）
  useEffect(() => {
    async function initialize() {
      setIsLoading(true);
      try {
        const agentList = await fetchAgents();
        console.log(
          '前端拉取到 agents 数量:',
          agentList.length,
          agentList.map(a => a.name)
        );
        setAgents(agentList);

        // 🔥 修复：尝试恢复之前选中的智能体，如果没有则使用第一个
        if (agentList.length > 0) {
          const savedAgentId = loadSelectedAgentId();
          const targetAgent = savedAgentId
            ? agentList.find(a => a.id === savedAgentId) || agentList[0]
            : agentList[0];

          console.log(
            '恢复选中的智能体:',
            savedAgentId
              ? `从缓存恢复: ${targetAgent.name}`
              : `默认选择: ${targetAgent.name}`
          );
          setSelectedAgent(targetAgent);
        }
      } catch (error) {
        console.error('初始化智能体时出错:', error);
      } finally {
        setIsLoading(false);
      }
    }
    initialize();
  }, []);

  useEffect(() => {
    if (
      agents.length > 0 &&
      (!selectedAgent || !agents.find(a => a.id === selectedAgent.id))
    ) {
      setSelectedAgent(agents[0]);
    }
  }, [agents]);

  // 检查智能体是否有必填的全局变量（用于判断是否需要弹出配置表单）
  const checkRequiredVariables = useCallback((agent: Agent): boolean => {
    if (agent.type !== 'fastgpt' || !agent.globalVariables) {
      return true; // 非FastGPT智能体或无全局变量，直接通过
    }

    const requiredVars = agent.globalVariables.filter(v => v.required);
    if (requiredVars.length === 0) {
      return true; // 无必填变量，直接通过
    }

    // 修改：每次切换智能体时都需要弹出配置表单（如果有必填变量）
    // 不再检查localStorage中的保存值，始终返回false以触发表单弹出
    return false;
  }, []);

  // 🔥 新增：页面刷新完成后检查智能体参数
  useEffect(() => {
    // 只在页面刷新完成后（isLoading变为false）且智能体已恢复时执行一次检查
    if (!isLoading && selectedAgent && !hasCheckedAfterRefresh) {
      console.log('🔍 页面刷新完成，检查智能体参数:', selectedAgent.name);

      // 检查是否需要填写全局变量
      const needsVariables = !checkRequiredVariables(selectedAgent);

      if (needsVariables) {
        console.log('📋 页面刷新后需要配置智能体参数:', selectedAgent.name);

        // 加载已保存的变量值（如果有的话），用于表单预填充
        const savedValues = localStorage.getItem(
          `agent-variables-${selectedAgent.id}`
        );
        if (savedValues) {
          try {
            const parsed = JSON.parse(savedValues);
            setGlobalVariables(parsed);
          } catch {
            setGlobalVariables([]);
          }
        } else {
          setGlobalVariables([]);
        }

        // 显示配置表单
        setShowGlobalVariablesForm(true);
      }

      // 标记已检查，避免重复检查
      setHasCheckedAfterRefresh(true);
    }
  }, [
    isLoading,
    selectedAgent,
    hasCheckedAfterRefresh,
    checkRequiredVariables,
  ]);

  // 请求中断相关函数
  const abortCurrentRequest = useCallback(() => {
    if (abortControllerRef.current && isRequestActive) {
      console.log('中断当前请求');
      try {
        abortControllerRef.current.abort();
      } catch (error: unknown) {
        // 忽略 AbortError，这是预期的行为
        if (error instanceof Error && error.name !== 'AbortError') {
          console.warn('中断请求时发生意外错误:', error);
        }
      }
      abortControllerRef.current = null;
      setIsRequestActive(false);
    }
  }, [isRequestActive]);

  const setAbortController = useCallback(
    (controller: AbortController | null) => {
      abortControllerRef.current = controller;
      setIsRequestActive(!!controller);
    },
    []
  );

  const selectAgent = useCallback(
    (agent: Agent) => {
      // 避免重复设置相同的智能体
      if (selectedAgent?.id === agent.id) {
        return;
      }

      console.log('🔄 智能体切换开始:', selectedAgent?.name, '->', agent.name);

      // 🔥 新增：中断当前请求
      abortCurrentRequest();

      // 🔥 修复：在状态更新前发送事件，确保事件中的toAgent是正确的
      window.dispatchEvent(
        new CustomEvent('agent-switching', {
          detail: {
            fromAgent: selectedAgent,
            toAgent: agent, // 🔥 关键：直接传递目标智能体对象
            startNewConversation: true, // 🔥 新增：标识需要开始新对话
          },
        })
      );

      // 🔥 修复：在事件发送后设置智能体，确保事件处理器能获取到正确的toAgent
      setSelectedAgent(agent);

      // 🔥 新增：持久化选中的智能体ID，修复页面刷新后恢复错误的问题
      saveSelectedAgent(agent.id);

      // 🔥 重置页面刷新检查标志位，确保主动切换智能体时能正常检查参数
      setHasCheckedAfterRefresh(false);

      // 检查是否需要填写全局变量
      const needsVariables = !checkRequiredVariables(agent);

      if (needsVariables) {
        // 需要填写全局变量，显示表单
        // 同时加载已保存的变量值（如果有的话），用于表单预填充
        const savedValues = localStorage.getItem(`agent-variables-${agent.id}`);
        if (savedValues) {
          try {
            const parsed = JSON.parse(savedValues);
            setGlobalVariables(parsed);
          } catch {
            setGlobalVariables([]);
          }
        } else {
          setGlobalVariables([]);
        }
        setShowGlobalVariablesForm(true);
      } else {
        // 不需要填写全局变量的情况（非FastGPT或无必填变量）
        setGlobalVariables([]);
      }
    },
    [selectedAgent?.id, checkRequiredVariables, abortCurrentRequest]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const toggleHistorySidebar = useCallback(() => {
    setHistorySidebarOpen(prev => !prev);
  }, []);

  const closeSidebars = useCallback(() => {
    setSidebarOpen(false);
    setHistorySidebarOpen(false);
  }, []);

  // 更新智能体配置
  const updateAgentConfig = useCallback(
    (config: Partial<Agent>) => {
      if (!selectedAgent) return;

      // 更新选中的智能体
      setSelectedAgent(prev => {
        if (!prev) return null;

        const updated = {
          ...prev,
          ...config,
        };

        console.log('更新智能体配置:', updated);
        return updated;
      });
    },
    [selectedAgent]
  );

  // 设置点击处理
  const onSettingsClick = useCallback(() => {
    // 导航到设置页面或打开设置对话框
    console.log('打开设置');
    // 这里可以添加具体的设置逻辑
  }, []);

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
    // 请求中断相关
    abortCurrentRequest,
    setAbortController,
    isRequestActive,
    // 设置相关
    onSettingsClick,
  };

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within a AgentProvider');
  }
  return context;
}
