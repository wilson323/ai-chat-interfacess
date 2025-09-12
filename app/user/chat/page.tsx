"use client"
import React, { useEffect } from "react";
import { ChatContainer } from "../../../components/chat/ChatContainerRefactored";

export default function UserChatPage() {
  // 页面级别的清理逻辑
  useEffect(() => {
    return () => {
      // 页面卸载时的清理工作
    }
  }, [])

  return (
    <div className="h-screen flex flex-col">
      <ChatContainer />
    </div>
  );
} 