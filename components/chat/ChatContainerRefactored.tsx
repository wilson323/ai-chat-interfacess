/**
 * 重构后的聊天容器组件
 * 基于shadcn/ui组件构建，避免自定义代码过多
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatHistory } from '../chat-history';
import { HistoryManager } from '../history-manager';
import { Agent } from '@/types/agent';
import { Message } from '@/types/message';
import { GlobalVariable } from '@/types/global-variable';
import { ProcessingStep } from '@/types/message';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface ChatContainerProps {
  // 智能体相关
  selectedAgent: Agent | null;
  agents: Agent[];
  onAgentChange: (agent: Agent) => void;

  // 消息相关
  messages: Message[];
  onEditMessage?: (message: Message) => void;
  onDeleteMessage?: (message: Message) => void;
  onCopyMessage?: (message: Message) => void;
  onLikeMessage?: (message: Message) => void;
  onDislikeMessage?: (message: Message) => void;

  // 输入相关
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onFileUpload?: (files: File[]) => void;
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile?: (fileId: string) => void;

  // 状态相关
  isTyping: boolean;
  isRecording: boolean;
  isSending: boolean;
  processingSteps: ProcessingStep[];
  showProcessingFlow: boolean;

  // 全局变量
  globalVariables: GlobalVariable[];
  onGlobalVariablesChange: (variables: GlobalVariable[]) => void;

  // 历史记录
  onSelectHistory: (messages: Message[], chatId: string) => void;
  onNewChat: () => void;
  onManageHistory?: () => void;

  // 其他
  onSettingsClick: () => void;
  className?: string;
}

export function ChatContainer({
  selectedAgent,
  agents,
  onAgentChange,
  messages,
  onEditMessage,
  onDeleteMessage,
  onCopyMessage,
  onLikeMessage,
  onDislikeMessage,
  input,
  onInputChange,
  onSendMessage,
  onFileUpload,
  onVoiceStart,
  onVoiceStop,
  uploadedFiles,
  onRemoveFile,
  isTyping,
  isRecording,
  isSending,
  processingSteps,
  showProcessingFlow,
  globalVariables,
  onGlobalVariablesChange,
  onSelectHistory,
  onNewChat,
  onManageHistory,
  onSettingsClick,
  className,
}: ChatContainerProps) {
  return (
    <div className={`flex h-full ${className}`}>
      {/* 主聊天区域 */}
      <div className='flex-1 flex flex-col'>
        <Card className='h-full flex flex-col'>
          {/* 聊天头部 */}
          <CardHeader className='pb-0'>
            <ChatHeader
              selectedAgent={selectedAgent}
              agents={agents}
              globalVariables={globalVariables}
              onAgentChange={onAgentChange}
              onGlobalVariablesChange={onGlobalVariablesChange}
              onSettingsClick={onSettingsClick}
            />
          </CardHeader>

          {/* 聊天消息区域 */}
          <CardContent className='flex-1 p-0'>
            <ChatMessages
              messages={messages}
              isTyping={isTyping}
              processingSteps={processingSteps}
              showProcessingFlow={showProcessingFlow}
              onEditMessage={onEditMessage}
              onDeleteMessage={onDeleteMessage}
              onCopyMessage={onCopyMessage}
              onLikeMessage={onLikeMessage}
              onDislikeMessage={onDislikeMessage}
            />
          </CardContent>

          {/* 聊天输入区域 */}
          <CardFooter className='pt-0'>
            <ChatInput
              value={input}
              onChange={onInputChange}
              onSend={onSendMessage}
              onFileUpload={onFileUpload}
              onVoiceStart={onVoiceStart}
              onVoiceStop={onVoiceStop}
              uploadedFiles={uploadedFiles}
              onRemoveFile={onRemoveFile}
              isRecording={isRecording}
              isSending={isSending}
              disabled={!selectedAgent}
            />
          </CardFooter>
        </Card>
      </div>

      {/* 侧边栏 */}
      <div className='w-80 border-l bg-muted/30'>
        <Tabs defaultValue='history' className='h-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='history'>历史记录</TabsTrigger>
            <TabsTrigger value='manage'>管理</TabsTrigger>
          </TabsList>

          <TabsContent value='history' className='h-full m-0'>
            <ChatHistory
              onClose={() => {}}
              onSelect={onSelectHistory}
              onNewChat={onNewChat}
              onManageHistory={onManageHistory}
            />
          </TabsContent>

          <TabsContent value='manage' className='h-full m-0'>
            <HistoryManager
              open={true}
              onOpenChange={() => {}}
              onHistoryUpdated={() => {}}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
