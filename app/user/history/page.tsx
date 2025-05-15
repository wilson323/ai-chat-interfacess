import React from "react";
import { HistoryList } from "../../../components/history/history-list";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Message } from "@/types/message";

export default function UserHistoryPage() {
  const router = useRouter();

  // 处理返回
  const handleClose = () => {
    router.push("/user");
  };

  // 处理选择聊天
  const handleSelect = (messages: Message[], chatId: string) => {
    // 保存选中的聊天ID到localStorage
    localStorage.setItem("selectedChatId", chatId);
    // 跳转到聊天页面
    router.push("/user");
  };

  // 处理新建聊天
  const handleNewChat = () => {
    // 清除选中的聊天ID
    localStorage.removeItem("selectedChatId");
    // 跳转到聊天页面
    router.push("/user");
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>对话历史</CardTitle>
          </div>
          <Button size="sm" onClick={handleNewChat}>新建对话</Button>
        </CardHeader>
        <CardContent>
          <HistoryList
            onSelect={handleSelect}
            onNewChat={handleNewChat}
            viewType="dialog"
          />
        </CardContent>
      </Card>
    </div>
  );
}