'use client';
import React, { useEffect } from 'react';
import { ChatContainer } from '../../../components/chat/ChatContainerRefactored';
import { useAgent } from '../../../context/agent-context';
import { useChat } from '../../../hooks/useChat';

export default function UserChatPage() {
  // 页面级别的清理逻辑
  useEffect(() => {
    return () => {
      // 页面卸载时的清理工作
    };
  }, []);

  const {
    agents,
    selectedAgent,
    selectAgent,
    globalVariables,
    setGlobalVariables,
    onSettingsClick,
    abortCurrentRequest,
    isRequestActive
  } = useAgent();

  const {
    messages,
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
    onSelectHistory,
    onNewChat,
    onManageHistory,
    onEditMessage,
    onDeleteMessage,
    onCopyMessage,
    onLikeMessage,
    onDislikeMessage
  } = useChat();

  return (
    <div className='h-screen flex flex-col'>
      <ChatContainer
        selectedAgent={selectedAgent}
        agents={agents || []}
        onAgentChange={selectAgent}
        messages={messages}
        onEditMessage={onEditMessage}
        onDeleteMessage={onDeleteMessage}
        onCopyMessage={onCopyMessage}
        onLikeMessage={onLikeMessage}
        onDislikeMessage={onDislikeMessage}
        input={input}
        onInputChange={onInputChange}
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
        onVoiceStart={onVoiceStart}
        onVoiceStop={onVoiceStop}
        uploadedFiles={uploadedFiles}
        onRemoveFile={onRemoveFile}
        isTyping={isTyping}
        isRecording={isRecording}
        isSending={isSending}
        processingSteps={processingSteps}
        showProcessingFlow={showProcessingFlow}
        globalVariables={globalVariables}
        onGlobalVariablesChange={setGlobalVariables}
        onSelectHistory={onSelectHistory}
        onNewChat={onNewChat}
        onManageHistory={onManageHistory}
        onSettingsClick={onSettingsClick}
        onRequestAbort={abortCurrentRequest}
        isRequestActive={isRequestActive}
      />
    </div>
  );
}
