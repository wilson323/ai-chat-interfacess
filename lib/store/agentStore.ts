import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loadAgents, saveAgents } from "@/lib/storage/index";
import type { Agent } from "@/types/agent";

interface AgentState {
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (agent: Agent) => void;
  deleteAgent: (agentId: string) => void;
}

export const useAgentStore = create<AgentState>()(
  persist<AgentState>(
    (set: (state: Partial<AgentState>) => void, get: () => AgentState) => ({
      agents: loadAgents() ?? [],
      setAgents: (agents: Agent[]) => {
        saveAgents(agents);
        set({ agents });
      },
      addAgent: (agent: Agent) => {
        const agents = [...get().agents, agent];
        saveAgents(agents);
        set({ agents });
      },
      updateAgent: (agent: Agent) => {
        const agents = get().agents.map((a: Agent) => a.id === agent.id ? agent : a);
        saveAgents(agents);
        set({ agents });
      },
      deleteAgent: (agentId: string) => {
        const agents = get().agents.filter((a: Agent) => a.id !== agentId);
        saveAgents(agents);
        set({ agents });
      },
    }),
    { name: "agent-storage" }
  )
); 