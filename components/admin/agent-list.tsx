"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAgent } from "@/context/agent-context"
import { Bot, Plus, Search, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/context/language-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CadIcon } from "@/components/ui/icons/CadIcon"
import { AgentForm } from "@/components/admin/agent-form"
import { Switch } from "@/components/ui/switch"
import { fetchAgents, createAgent, updateAgent, deleteAgent } from "@/lib/services/admin-agent-service"
import { AgentType } from "@/types/agent"

export interface AgentListProps {
  typeFilter?: string;
}

export function AgentList({ typeFilter: propTypeFilter }: AgentListProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [agents, setAgents] = useState<any[]>([])
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>(propTypeFilter || 'fastgpt')
  const [editingAgent, setEditingAgent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showAgentForm, setShowAgentForm] = useState(false)
  const [switchLoadingId, setSwitchLoadingId] = useState<string | null>(null)

  useEffect(() => {
    if (propTypeFilter) setTypeFilter(propTypeFilter)
    setLoading(true)
    fetchAgents()
      .then(setAgents)
      .catch((err) => {
        toast({
          title: "加载失败",
          description: String(err?.message || err),
          variant: "destructive",
        });
        if (String(err?.message).includes("无权限")) {
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 1500);
        }
      })
      .finally(() => setLoading(false))
  }, [propTypeFilter])

  const isFastgptType = (type: string) =>
    type === 'fastgpt' || type === 'cad-analyzer' || type === 'image-editor';

  const filteredAgents = useMemo(() => {
    if (typeFilter === 'fastgpt') return agents.filter(agent => agent.type === 'fastgpt' && agent.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (typeFilter === 'other') return agents.filter(agent => agent.type !== 'fastgpt' && agent.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return agents.filter(agent => agent.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [agents, searchQuery, typeFilter])

  const typeLabel = (type: string) => {
    switch(type) {
      case "fastgpt": return "FastGPT";
      case "chat": return "聊天型";
      case "image-editor": return "图像编辑";
      case "cad-analyzer": return "CAD解读";
      default: return type;
    }
  }

  const getAgentIcon = (agent: any) => {
    if (agent.iconType === "cad") return <CadIcon className="h-5 w-5" />;
    return <Bot className="h-5 w-5 text-pantone369-600 dark:text-pantone369-400" />;
  }

  const handleAddAgentClick = () => {
    setEditingAgent(null);
    setShowAgentForm(true);
  };

  const handleEditAgentClick = (agent: any) => {
    setEditingAgent(agent);
    setShowAgentForm(true);
  };

  const handleAgentFormSave = async (agentData: any) => {
    if (editingAgent) {
      await handleUpdateAgent({ ...editingAgent, ...agentData });
    } else {
      await createAgent(agentData);
    }
    setLoading(true);
    fetchAgents().then(setAgents).finally(() => setLoading(false));
    setShowAgentForm(false);
    setEditingAgent(null);
  };

  const handleUpdateAgent = async (agent: any) => {
    try {
      const updated = await updateAgent(agent);
      setAgents((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast({ title: t("agentUpdated"), description: agent.name });
    } catch (e) {
      toast({ title: "错误", description: String(e), variant: "destructive" });
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      await deleteAgent(id);
      setLoading(true);
      fetchAgents().then(setAgents).finally(() => setLoading(false));
      toast({ title: t("agentDeleted") });
    } catch (e) {
      toast({ title: "错误", description: String(e), variant: "destructive" });
    }
  };

  return (
    <Card className="h-full flex flex-col max-h-[90vh]">
      <CardHeader className="pb-3 sticky top-0 z-10 bg-background">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-pantone369-500" />
            {t("agents")}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant={typeFilter==='fastgpt'?'default':'outline'} onClick={()=>setTypeFilter('fastgpt')}>FastGPT</Button>
            <Button size="sm" variant={typeFilter==='other'?'default':'outline'} onClick={()=>setTypeFilter('other')}>其他</Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handleAddAgentClick}
                    className="h-8 gap-1 bg-pantone369-500 hover:bg-pantone369-600"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t("newAgent")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("createNewAgent")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-y-auto pt-6 md:pt-8" style={{scrollMarginTop: '64px'}}>
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchAgents")}
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            <Button
              size="sm"
              onClick={handleAddAgentClick}
              className="w-full mb-2 bg-pantone369-500 hover:bg-pantone369-600"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> 新增智能体
            </Button>
            {filteredAgents.length > 0 ? (
              filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    "hover:bg-accent/50 relative group",
                    selectedAgent?.id === agent.id
                      ? "bg-accent/70 border-pantone369-200 dark:border-pantone369-800"
                      : "border-border",
                  )}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex gap-2 mr-3 shrink-0 z-10 items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-pantone369-600 dark:text-pantone369-400 hover:bg-pantone369-50 dark:hover:bg-pantone369-900/20"
                            onClick={e => { e.stopPropagation(); handleEditAgentClick(agent); }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("editAgent")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {agent.type !== 'fastgpt' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-2"
                              onClick={e => { e.stopPropagation(); window.open(`/admin/${agent.type}-history`, '_blank') }}
                            >
                              {t('manageAgents')}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('manageAgents')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-pantone369-100 dark:bg-pantone369-900/30 flex items-center justify-center shrink-0">
                      {getAgentIcon(agent)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate flex items-center gap-2">
                        {agent.name}
                        {agent.isPublished ? (
                          <Badge
                            variant="outline"
                            className="bg-pantone369-100 dark:bg-pantone369-900/30 text-pantone369-700 dark:text-pantone369-400 border-pantone369-200 dark:border-pantone369-800"
                          >
                            {t("published")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted/30 text-muted-foreground">
                            {t("draft")}
                          </Badge>
                        )}
                        <Switch
                          checked={agent.isPublished}
                          disabled={switchLoadingId === agent.id}
                          onCheckedChange={async (checked) => {
                            setSwitchLoadingId(agent.id);
                            const prev = agent.isPublished;
                            setAgents((prevAgents) =>
                              prevAgents.map((a) =>
                                a.id === agent.id ? { ...a, isPublished: checked } : a
                              )
                            );
                            try {
                              const updated = { ...agent, isPublished: checked };
                              await handleUpdateAgent(updated);
                            } catch (e) {
                              setAgents((prevAgents) =>
                                prevAgents.map((a) =>
                                  a.id === agent.id ? { ...a, isPublished: prev } : a
                                )
                              );
                              toast({ title: "发布失败", description: String(e), variant: "destructive" });
                            } finally {
                              setSwitchLoadingId(null);
                            }
                          }}
                          className="ml-2"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {agent.description || t("description")}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {typeLabel(agent.type)}
                        </Badge>
                        {agent.apiKey && agent.appId ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          >
                            {t("configured")}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1 bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
                          >
                            {t("notConfigured")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">暂无智能体，请点击上方按钮新增</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      {showAgentForm && (
        <AgentForm
          agent={editingAgent}
          onSave={handleAgentFormSave}
          onClose={() => { setShowAgentForm(false); setEditingAgent(null); }}
        />
      )}
    </Card>
  )
}
