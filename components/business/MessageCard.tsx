/**
 * 消息卡片组件
 * 基于shadcn/ui Card组件构建，避免自定义代码
 */

import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Message } from '@/types/message'
import { formatDistanceToNow } from 'date-fns'
import { Edit, Trash2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageCardProps {
  message: Message
  onEdit?: (message: Message) => void
  onDelete?: (message: Message) => void
  onCopy?: (message: Message) => void
  onLike?: (message: Message) => void
  onDislike?: (message: Message) => void
  showActions?: boolean
  className?: string
}

export function MessageCard({
  message,
  onEdit,
  onDelete,
  onCopy,
  onLike,
  onDislike,
  showActions = true,
  className
}: MessageCardProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const isSystem = message.role === 'system'

  return (
    <Card className={cn(
      'w-full transition-all duration-200 hover:shadow-md',
      {
        'ml-8 bg-muted/50': isUser,
        'mr-8 bg-background': isAssistant,
        'bg-yellow-50 border-yellow-200': isSystem,
      },
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage 
                src={isUser ? '/user-avatar.png' : '/bot-avatar.png'} 
                alt={message.role}
              />
              <AvatarFallback>
                {isUser ? 'U' : isAssistant ? 'A' : 'S'}
              </AvatarFallback>
            </Avatar>
            <Badge variant={isUser ? 'default' : isAssistant ? 'secondary' : 'outline'}>
              {message.role}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
          </div>
          
          {message.metadata?.processingTime && (
            <Badge variant="outline" className="text-xs">
              {message.metadata.processingTime}ms
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="prose prose-sm max-w-none">
          {message.content}
        </div>
        
        {message.metadata?.tokens && (
          <div className="mt-2 text-xs text-muted-foreground">
            Tokens: {message.metadata.tokens}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="pt-2">
          <div className="flex items-center space-x-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(message)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {onCopy && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(message)}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            
            {onLike && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(message)}
                className="h-8 w-8 p-0"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
            )}
            
            {onDislike && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDislike(message)}
                className="h-8 w-8 p-0"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(message)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
