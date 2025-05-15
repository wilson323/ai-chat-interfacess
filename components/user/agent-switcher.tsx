"use client"

import { useState } from "react";
import { useAgent } from "@/context/agent-context";
import { useMobile } from "@/hooks/use-mobile";
import { Avatar } from "antd";
import { cn } from "@/lib/utils";

export default function AgentSwitcher() {
  const { agents, selectedAgent, selectAgent } = useAgent();
  const isMobile = useMobile();
  const [showList, setShowList] = useState(false);

  // 移动端底部弹窗样式
  if (isMobile) {
    return (
      <>
        <div
          className="agent-switcher-mobile flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg bg-gradient-to-br from-white/80 via-pantone369-50/60 to-pantone369-100/40 dark:from-zinc-900/80 dark:via-pantone369-900/30 dark:to-zinc-900/60 border border-pantone369-100 dark:border-pantone369-800/40 backdrop-blur-md cursor-pointer"
          onClick={() => setShowList(true)}
        >
          <Avatar
            size={32}
            className="bg-gradient-to-r from-primary-color to-secondary-color text-white font-medium shadow-md"
            style={{ borderRadius: 10 }}
          >
            {selectedAgent?.icon || selectedAgent?.name?.[0] || "🤖"}
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-base font-medium text-pantone369-700 dark:text-pantone369-200 truncate">
              {selectedAgent?.name || "选择智能体"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {selectedAgent?.description || "点击切换智能体"}
            </span>
          </div>
        </div>
        {/* 底部弹窗列表 */}
        {showList && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30 backdrop-blur-sm" onClick={() => setShowList(false)}>
            <div
              className="w-full rounded-t-3xl bg-white dark:bg-zinc-900 shadow-2xl p-4 max-h-[60vh] overflow-y-auto animate-slide-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center text-lg font-semibold mb-4 text-pantone369-700 dark:text-pantone369-200">选择智能体</div>
              {agents.length === 0 ? (
                <div className="text-muted-foreground text-sm text-center py-8">无可用智能体</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {agents.map(agent => (
                    <div
                      key={agent.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200",
                        selectedAgent?.id === agent.id
                          ? "bg-gradient-to-r from-primary-color/10 to-secondary-color/10 border border-primary-color/30 dark:border-secondary-color/30 shadow"
                          : "hover:bg-primary-color/5 dark:hover:bg-secondary-color/10"
                      )}
                      onClick={() => {
                        selectAgent(agent);
                        setShowList(false);
                      }}
                    >
                      <Avatar
                        size={36}
                        className="bg-gradient-to-r from-primary-color to-secondary-color text-white font-medium shadow-md"
                        style={{ borderRadius: 12 }}
                      >
                        {agent.icon || agent.name?.[0] || "🤖"}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-medium text-pantone369-700 dark:text-pantone369-200 truncate">{agent.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{agent.description}</div>
                      </div>
                      {selectedAgent?.id === agent.id && (
                        <span className="ml-2 text-primary-color dark:text-secondary-color font-bold">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  // PC端下拉框
  return (
    <div className="agent-switcher px-4 py-2 rounded-xl shadow-lg bg-gradient-to-br from-white/80 via-pantone369-50/60 to-pantone369-100/40 dark:from-zinc-900/80 dark:via-pantone369-900/30 dark:to-zinc-900/60 border border-pantone369-100 dark:border-pantone369-800/40 backdrop-blur-md">
      {agents.length === 0 ? (
        <div className="text-muted-foreground text-sm">无可用智能体</div>
      ) : (
        <select
          value={selectedAgent?.id || ""}
          onChange={e => {
            const agent = agents.find(a => a.id === e.target.value);
            if (agent) selectAgent(agent);
          }}
          className="rounded-lg px-3 py-2 bg-white/80 dark:bg-zinc-900/80 text-base font-medium text-pantone369-700 dark:text-pantone369-200 shadow-sm border-none outline-none focus:ring-2 focus:ring-pantone369-400/40 transition-all duration-200 hover:bg-pantone369-50/80 dark:hover:bg-pantone369-900/40 cursor-pointer"
          style={{ minWidth: 120 }}
        >
          {agents.map(agent => (
            <option
              key={agent.id}
              value={agent.id}
              className="bg-white dark:bg-zinc-900 text-pantone369-700 dark:text-pantone369-200 font-medium rounded hover:bg-pantone369-100/80 dark:hover:bg-pantone369-800/60 transition-all duration-150"
            >
              {agent.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// 补充动画样式
// tailwind.config.ts 需加 keyframes: { 'slide-up': { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } } }, animation: { 'slide-up': 'slide-up 0.3s cubic-bezier(0.4,0,0.2,1)' } 