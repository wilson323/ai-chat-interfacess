"use client"

import { useEffect, useState } from "react";
import { useAgent } from "@/context/agent-context";

export default function AgentSwitcher() {
  const { agents, selectedAgent, selectAgent } = useAgent();

  return (
    <div className="agent-switcher px-4 py-2">
      {agents.length === 0 ? (
        <div className="text-muted-foreground text-sm">无可用智能体</div>
      ) : (
        <select
          value={selectedAgent?.id || ""}
          onChange={e => {
            const agent = agents.find(a => a.id === e.target.value);
            if (agent) selectAgent(agent);
          }}
          className="border rounded px-2 py-1"
        >
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
} 