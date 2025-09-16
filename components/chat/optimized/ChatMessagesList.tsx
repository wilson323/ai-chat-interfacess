/**
 * 优化的聊天消息列表组件
 * 使用虚拟化技术优化大量消息的渲染性能
 */

'use client';

import React, { memo, useMemo } from 'react';
import { ChatMessage } from './ChatMessage';
import type { Message } from '@/types/message';

// 动态导入react-window，避免构建时错误
let List: any = null;
try {
  const reactWindow = require('react-window');
  List = reactWindow.FixedSizeList;
} catch (error) {
  // react-window未安装时的fallback
  console.warn('react-window not available, using fallback rendering');
}

interface ChatMessagesListProps {
  messages: Message[];
  onMessageAction?: (action: string, message: Message) => void;
  className?: string;
}

interface MessageItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    messages: Message[];
    onMessageAction?: (action: string, message: Message) => void;
  };
}

const MessageItem = memo<MessageItemProps>(({ index, style, data }) => {
  const { messages, onMessageAction } = data;
  const message = messages[index];

  return (
    <div style={style}>
      <ChatMessage
        message={message}
        onMessageAction={onMessageAction}
        className="px-4"
      />
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

const ChatMessagesList = memo<ChatMessagesListProps>(({
  messages,
  onMessageAction,
  className
}) => {
  const itemData = useMemo(() => ({
    messages,
    onMessageAction,
  }), [messages, onMessageAction]);

  const itemCount = messages.length;

  // 空状态提示
  const renderEmptyState = () => (
    <div className={`flex-1 overflow-y-auto ${className || ''}`}>
      <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4" aria-hidden="true">💬</div>
        <h3 className="text-lg font-semibold mb-1">开始对话</h3>
        <p className="text-sm">选择一个智能体并在下方输入框开始聊天</p>
      </div>
    </div>
  );

  // 如果没有消息，直接渲染空状态
  if (itemCount === 0) {
    return renderEmptyState();
  }

  // 如果消息数量较少或react-window不可用，不使用虚拟化
  if (itemCount <= 50 || !List) {
    return (
      <div className={`flex-1 overflow-y-auto ${className || ''}`}>
        <div className="space-y-4 p-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onMessageAction={onMessageAction}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 ${className || ''}`}>
      <List
        height={600} // 固定高度，实际使用中应该动态计算
        itemCount={itemCount}
        itemSize={120} // 估算每个消息的高度
        itemData={itemData}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {MessageItem}
      </List>
    </div>
  );
});

ChatMessagesList.displayName = 'ChatMessagesList';

export { ChatMessagesList };
