"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAgent } from "@/context/agent-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentForm } from "@/components/admin/agent-form"
import { AgentList } from "@/components/admin/agent-list"
import { useLanguage } from "@/context/language-context"
import { Bot, Settings, Users } from "lucide-react"
// 导入调试面板组件
import { DebugPanel } from "./debug-panel"
import { DbAdminPanel } from "@/components/admin/db-admin-panel"
import { AgentType } from "@/types/agent"

export function AdminContainer() {
  const { selectedAgent } = useAgent()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("fastgpt")

  return (
    <div className="flex flex-col h-full relative">
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6 text-pantone369-500" />
                {t("adminDashboard")}
              </CardTitle>
              <CardDescription>{t("manageAgents")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="fastgpt" value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
                <TabsList className="grid grid-cols-4 w-full mb-6 mt-2 sticky top-0 z-20 bg-background">
                  <TabsTrigger value="fastgpt" className="flex items-center gap-2">FastGPT 智能体管理</TabsTrigger>
                  <TabsTrigger value="db" className="flex items-center gap-2">数据库管理</TabsTrigger>
                </TabsList>

                <TabsContent value="fastgpt" className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 gap-6">
                    <AgentList typeFilter="fastgpt" />
                  </div>
                </TabsContent>

                <TabsContent value="db" className="min-h-[300px] mt-4">
                  <DbAdminPanel />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
      {process.env.NODE_ENV !== "production" && <DebugPanel />}
    </div>
  )
}
