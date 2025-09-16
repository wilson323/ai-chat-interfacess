/**
 * 优化的聊天消息组件
 * 使用React.memo和useMemo优化性能
 */

'use client';

import React, { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Message } from '@/types/message';
import { MessageType } from '@/types/message';

interface ChatMessageProps {
  message: Message;
  onMessageAction?: (action: string, message: Message) => void;
  className?: string;
}

const ChatMessage = memo<ChatMessageProps>(({ message, onMessageAction, className }) => {
  const messageTime = useMemo(() => {
    return new Date(message.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [message.timestamp]);

  const isUser = message.type === MessageType.User;
  const isAssistant = message.type === MessageType.Assistant;

  const handleAction = (action: string) => {
    onMessageAction?.(action, message);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    handleAction('copy');
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${className || ''}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
        {/* 头像 */}
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.avatar} alt={message.agentName || 'User'} />
          <AvatarFallback>
            {isUser ? 'U' : (message.agentName?.[0] || 'A')}
          </AvatarFallback>
        </Avatar>

        {/* 消息内容 */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* 消息头部 */}
          <div className="flex items-center space-x-2 mb-1">
            {!isUser && message.agentName && (
              <span className="text-sm font-medium text-gray-700">{message.agentName}</span>
            )}
            <span className="text-xs text-gray-500">{messageTime}</span>
            {message.agentType && (
              <Badge variant="secondary" className="text-xs">
                {message.agentType}
              </Badge>
            )}
          </div>

          {/* 消息卡片 */}
          <Card className={`${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100'} border-0`}>
            <CardContent className="p-3">
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </CardContent>
          </Card>

          {/* 消息操作 */}
          <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isUser ? 'end' : 'start'}>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-3 w-3 mr-2" />
                  复制
                </DropdownMenuItem>
                {isUser && (
                  <>
                    <DropdownMenuItem onClick={() => handleAction('edit')}>
                      <Edit className="h-3 w-3 mr-2" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('delete')}>
                      <Trash2 className="h-3 w-3 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </>
                )}
                {isAssistant && (
                  <>
                    <DropdownMenuItem onClick={() => handleAction('like')}>
                      <ThumbsUp className="h-3 w-3 mr-2" />
                      点赞
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('dislike')}>
                      <ThumbsDown className="h-3 w-3 mr-2" />
                      点踩
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export { ChatMessage };
