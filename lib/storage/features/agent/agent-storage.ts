/**
 * 智能体存储模块
 */
import type { Agent } from '@/types/agent';
import {
  AGENTS_KEY,
  SELECTED_AGENT_ID_KEY,
  LOCALLY_MODIFIED_AGENTS_KEY,
} from '../../shared/constants';

// SSR 兼容导出
let saveLocallyModifiedAgents: (agentIds: string[]) => void;
let loadLocallyModifiedAgents: () => string[];
let markAgentAsLocallyModified: (agentId: string) => void;
let saveAgents: (agents: Agent[]) => boolean;
let loadAgents: () => Agent[] | null;
let saveSelectedAgent: (agentId: string) => void;
let loadSelectedAgentId: () => string | null;

if (typeof window === 'undefined') {
  saveLocallyModifiedAgents = () => {};
  loadLocallyModifiedAgents = () => [];
  markAgentAsLocallyModified = () => {};
  saveAgents = () => false;
  loadAgents = () => null;
  saveSelectedAgent = () => {};
  loadSelectedAgentId = () => null;
} else {
  // 真实实现
  saveLocallyModifiedAgents = function (agentIds: string[]): void {
    try {
      localStorage.setItem(
        LOCALLY_MODIFIED_AGENTS_KEY,
        JSON.stringify(agentIds)
      );
    } catch (error) {
      console.error('Failed to save locally modified agents:', error);
    }
  };

  loadLocallyModifiedAgents = function (): string[] {
    try {
      const json = localStorage.getItem(LOCALLY_MODIFIED_AGENTS_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error('Failed to load locally modified agents:', error);
      return [];
    }
  };

  markAgentAsLocallyModified = function (agentId: string): void {
    try {
      const modifiedAgents = loadLocallyModifiedAgents();
      if (!modifiedAgents.includes(agentId)) {
        modifiedAgents.push(agentId);
        saveLocallyModifiedAgents(modifiedAgents);
      }
    } catch (error) {
      console.error('Failed to mark agent as locally modified:', error);
    }
  };

  saveAgents = function (agents: Agent[]): boolean {
    try {
      // 移除React组件（图标）以便序列化
      const serializableAgents = agents.map(({ icon, ...rest }) => {
        // 创建一个新对象以避免修改原始对象
        const cleanAgent = { ...rest };
        return cleanAgent;
      });

      const agentsJson = JSON.stringify(serializableAgents);
      localStorage.setItem(AGENTS_KEY, agentsJson);
      return true;
    } catch (error) {
      console.error('Failed to save agents to local storage:', error);
      return false;
    }
  };

  loadAgents = function (): Agent[] | null {
    try {
      const agentsJson = localStorage.getItem(AGENTS_KEY);
      if (!agentsJson) {
        return null;
      }
      return JSON.parse(agentsJson) as Agent[];
    } catch (error) {
      console.error('Failed to load agents from local storage:', error);
      return null;
    }
  };

  saveSelectedAgent = function (agentId: string): void {
    try {
      localStorage.setItem(SELECTED_AGENT_ID_KEY, agentId);
    } catch (error) {
      console.error(
        'Failed to save selected agent ID to local storage:',
        error
      );
    }
  };

  loadSelectedAgentId = function (): string | null {
    try {
      return localStorage.getItem(SELECTED_AGENT_ID_KEY);
    } catch (error) {
      console.error(
        'Failed to load selected agent ID from local storage:',
        error
      );
      return null;
    }
  };
}

export {
  saveLocallyModifiedAgents,
  loadLocallyModifiedAgents,
  markAgentAsLocallyModified,
  saveAgents,
  loadAgents,
  saveSelectedAgent,
  loadSelectedAgentId,
};
