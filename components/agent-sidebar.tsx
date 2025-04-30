"use client"
import { Layout, Typography, List, Avatar } from "antd"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useAgent } from "@/context/agent-context"
import { useLanguage } from "@/context/language-context"
import type { Agent } from "@/types/agent"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

const { Title } = Typography

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isAdmin?: boolean
}

export function AgentSidebar({ isOpen, onClose, isAdmin = false }: SidebarProps) {
  const { agents, selectedAgent, selectAgent } = useAgent()
  const { t } = useLanguage()
  const isMobile = useMobile()

  // 只在用户界面过滤已发布的智能体
  const filteredAgents = isAdmin ? agents : agents.filter((agent) => agent.isPublished)

  const handleAgentSelect = (agent: Agent) => {
    selectAgent(agent)
    if (isMobile) {
      onClose()
    }
  }

  return (
    <Layout.Sider
      width={280}
      className={cn(
        "fixed top-0 left-0 h-full z-50 transition-transform duration-500 ease-out",
        "bg-glass-bg backdrop-blur-xl border-r border-border-color",
        "transform -translate-x-full",
        isOpen && "transform translate-x-0",
        "lg:translate-x-0 lg:z-10",
      )}
      collapsedWidth={0}
      trigger={null}
      collapsible
      collapsed={!isOpen}
    >
      <div className="p-4 sm:p-6 border-b border-border-color mb-4 relative flex items-center justify-between">
        <div>
          <div className="absolute bottom-0 left-6 w-12 h-0.5 bg-gradient-to-r from-primary-color to-secondary-color rounded"></div>
          <Title level={5} className="flex items-center text-text-color m-0 text-base sm:text-lg">
            <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-primary-color to-secondary-color mr-2 sm:mr-3 shadow-glow"></span>
            {t("selectAgent")}
          </Title>
        </div>

        {/* 移动端关闭按钮 */}
        {isMobile && (
          <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <List
        className="px-2 sm:px-3 overflow-y-auto max-h-[calc(100vh-5rem)]"
        dataSource={filteredAgents}
        renderItem={(agent) => (
          <List.Item
            className={cn(
              "p-3 sm:p-4 flex items-center cursor-pointer transition-all duration-400 rounded-xl sm:rounded-2xl mx-1 sm:mx-2 mb-2 sm:mb-2.5",
              "relative overflow-hidden bg-white/5 backdrop-blur-sm",
              "hover:bg-primary-color/12 hover:translate-x-1",
              selectedAgent?.id === agent.id && "bg-primary-color/18",
            )}
            onClick={() => handleAgentSelect(agent)}
          >
            <div
              className={cn(
                "absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-color to-secondary-color",
                "transform -translate-x-2.5 transition-transform duration-400",
                selectedAgent?.id === agent.id && "transform translate-x-0",
              )}
            ></div>

            <Avatar
              size={isMobile ? 36 : 40}
              className="mr-3 sm:mr-4 flex-shrink-0 bg-gradient-to-r from-primary-color to-secondary-color text-white font-medium shadow-md"
              style={{ borderRadius: 10 }}
            >
              {agent.name.charAt(0)}
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="text-sm sm:text-base font-medium mb-0.5 sm:mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {agent.name}
              </div>
              <div className="text-xs sm:text-sm text-light-text whitespace-nowrap overflow-hidden text-ellipsis">
                {agent.description || t("description")}
              </div>
            </div>
          </List.Item>
        )}
      />
      {filteredAgents.length === 0 && (
        <div className="text-muted-foreground text-sm text-center py-8">无可用智能体</div>
      )}
    </Layout.Sider>
  )
}
