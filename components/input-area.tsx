"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input, Button } from "antd"
import { SendOutlined, AudioOutlined, PaperClipOutlined } from "@ant-design/icons"
import { cn } from "@/lib/utils"

// 添加文件上传相关导入
import { useAgent } from "@/context/agent-context"
import { FileUploader } from "@/components/file-uploader"
// 添加 useLanguage 导入
import { useLanguage } from "@/context/language-context"
import axios from 'axios'

const { TextArea } = Input

export default function InputArea() {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const textAreaRef = useRef<any>(null)
  const { selectedAgent } = useAgent()

  const { toggleHistorySidebar } = useAgent()

  // 在组件内部添加
  const { t } = useLanguage()

  // 获取 fastgptConfig 或 fileSelectConfig（兼容无fileSelectConfig情况）
  const fileSelectConfig = (selectedAgent as any)?.fileSelectConfig || {};
  const canShowImageUpload = selectedAgent?.supportsImageUpload !== false && !!fileSelectConfig.canSelectImg;

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.resizableTextArea.textArea.style.height = "auto"
      textAreaRef.current.resizableTextArea.textArea.style.height = `${textAreaRef.current.resizableTextArea.textArea.scrollHeight}px`
    }
  }, [message])

  const handleSend = () => {
    if (message.trim()) {
      // 创建一个事件来触发chat-container中的发送功能
      const event = new CustomEvent("send-message", {
        detail: { message: message.trim() },
      })
      window.dispatchEvent(event)

      // 清空输入
      setMessage("")

      // 自动调整文本区域大小
      if (textAreaRef.current) {
        textAreaRef.current.resizableTextArea.textArea.style.height = "auto"
      }
    }
  }

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording)
    // Here you would implement actual voice recording functionality
  }

  const toggleFileUpload = () => {
    setIsUploading(!isUploading)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 上传文件到 /api/upload，返回 url
  async function uploadFileToServer(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  }

  // 处理图片上传
  async function handleImageUpload(file: File) {
    const url = await uploadFileToServer(file);
    const message = {
      role: 'user',
      content: [
        { type: 'text', text: '请分析这张图片' },
        { type: 'image_url', image_url: { url } },
      ],
    };
    await sendToFastGPT({ chatId: selectedAgent?.chatId, stream: false, messages: [message] });
  }

  // 处理文件上传
  async function handleFileUpload(file: File) {
    const url = await uploadFileToServer(file);
    const message = {
      role: 'user',
      content: [
        { type: 'text', text: '请分析这个文件' },
        { type: 'file_url', name: file.name, url },
      ],
    };
    await sendToFastGPT({ chatId: selectedAgent?.chatId, stream: false, messages: [message] });
  }

  // 发送消息到 FastGPT
  async function sendToFastGPT(payload: any) {
    await axios.post('/api/chat-proxy', payload, {
      headers: { 'Authorization': `Bearer ${selectedAgent?.apiKey}` },
    });
  }

  return (
    <div className={cn("p-4.5 bg-bg-color/80 backdrop-blur-xl border-t border-border-color", "relative z-20")}>
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-line to-transparent opacity-40"></div>

      {/* 显示文件上传组件 */}
      {isUploading && <FileUploader onClose={() => setIsUploading(false)} />}

      <div
        className={cn(
          "flex items-center bg-card-bg rounded-2xl p-3.5 shadow-lg", // 增加阴影
          "border border-border-color transition-all duration-300 backdrop-blur-md", // 增加过渡效果
          "focus-within:border-primary-color focus-within:shadow-glow focus-within:-translate-y-1", // 增强焦点效果
        )}
      >
        {/* 文件上传按钮 - 根据智能体配置显示或隐藏 */}
        {selectedAgent?.supportsFileUpload !== false && (
          <Button
            type="text"
            icon={<PaperClipOutlined />}
            className={cn(
              "flex items-center justify-center p-2.5 rounded-full mr-1",
              "bg-white/10 backdrop-blur-sm text-light-text",
              "hover:text-primary-color hover:bg-primary-color/20 hover:scale-110",
            )}
            onClick={toggleFileUpload}
          />
        )}

        {/* 语音输入按钮 */}
        <Button
          type="text"
          icon={<AudioOutlined />}
          className={cn(
            "flex items-center justify-center p-2.5 rounded-full",
            "bg-white/10 backdrop-blur-sm text-light-text",
            "hover:text-primary-color hover:bg-primary-color/20 hover:scale-110",
            isRecording && "text-red-500 animate-pulse",
          )}
          onClick={toggleVoiceRecording}
        />

        <TextArea
          ref={textAreaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("inputPlaceholder")}
          autoSize={{ minRows: 1, maxRows: 4 }}
          className="flex-1 border-none outline-none px-3 py-3 bg-transparent text-text-color resize-none"
          style={{ boxShadow: "none" }}
        />

        <Button
          type="primary"
          icon={<SendOutlined />}
          className={cn(
            "w-11 h-11 rounded-[14px] flex items-center justify-center",
            "bg-gradient-to-r from-primary-dark to-primary-color",
            "shadow-primary transition-all duration-300 relative overflow-hidden",
            "hover:bg-gradient-to-r hover:from-primary-color hover:to-secondary-color",
            "hover:scale-105 hover:shadow-xl active:scale-95 ml-2.5", // 增强交互效果
          )}
          onClick={handleSend}
        />
      </div>

      {canShowImageUpload && (
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          id="image-upload-input"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />
      )}
    </div>
  )
}
