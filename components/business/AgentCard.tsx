/**
 * 智能体卡片组件
 * 基于shadcn/ui Card组件构建，避免自定义代码
 */

import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Agent } from '@/types/agent'
import { Bot, Settings, Eye, EyeOff, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  agent: Agent
  onEdit?: (agent: Agent) => void
  onDelete?: (agent: Agent) => void
  onToggle?: (agent: Agent) => void
  onSelect?: (agent: Agent) => void
  selected?: boolean
  showActions?: boolean
  className?: string
}

export function AgentCard({
  agent,
  onEdit,
  onDelete,
  onToggle,
  onSelect,
  selected = false,
  showActions = true,
  className
}: AgentCardProps) {
  return (
    <Card 
      className={cn(
        'w-full transition-all duration-200 hover:shadow-md cursor-pointer',
        {
          'ring-2 ring-primary': selected,
          'opacity-50': !agent.isActive,
        },
        className
      )}
      onClick={() => onSelect?.(agent)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback>
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold text-lg">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">{agent.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={agent.isActive ? 'default' : 'secondary'}>
              {agent.isActive ? 'Active' : 'Inactive'}
            </Badge>
            
            <Badge variant="outline">
              {agent.type}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {agent.config?.model && (
            <div className="text-sm">
              <span className="font-medium">Model:</span> {agent.config.model}
            </div>
          )}
          
          {agent.config?.temperature && (
            <div className="text-sm">
              <span className="font-medium">Temperature:</span> {agent.config.temperature}
            </div>
          )}
          
          {agent.config?.maxTokens && (
            <div className="text-sm">
              <span className="font-medium">Max Tokens:</span> {agent.config.maxTokens}
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-sm">
            {agent.config?.supportsFileUpload && (
              <Badge variant="outline" className="text-xs">
                File Upload
              </Badge>
            )}
            
            {agent.config?.supportsImageUpload && (
              <Badge variant="outline" className="text-xs">
                Image Upload
              </Badge>
            )}
            
            {agent.config?.supportsVoiceInput && (
              <Badge variant="outline" className="text-xs">
                Voice Input
              </Badge>
            )}
            
            {agent.config?.supportsVoiceOutput && (
              <Badge variant="outline" className="text-xs">
                Voice Output
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Switch
                checked={agent.isActive}
                onCheckedChange={() => onToggle?.(agent)}
                className="data-[state=checked]:bg-primary"
              />
              <span className="text-sm text-muted-foreground">
                {agent.isActive ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(agent)
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(agent)
                  }}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
