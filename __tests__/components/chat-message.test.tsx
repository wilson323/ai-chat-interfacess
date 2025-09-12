/**
 * ChatMessage 组件测试
 * 测试聊天消息的显示、编辑、删除等功能
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatMessage } from '@/components/chat-message';
import { MessageType, MessageRole } from '@/types/message';

// Mock 依赖
jest.mock('@/context/language-context', () => ({
  useLanguage: () => ({
    language: 'zh',
    t: (key: string) => key,
  }),
}));

jest.mock('@/hooks/use-responsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}));

describe('ChatMessage 组件测试', () => {
  const mockMessage = {
    id: 'test-message-1',
    type: MessageType.Text,
    role: MessageRole.User,
    content: 'Hello, this is a test message',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    metadata: {
      deviceId: 'test-device',
    },
  };

  const mockAssistantMessage = {
    id: 'test-message-2',
    type: MessageType.Text,
    role: MessageRole.Assistant,
    content: 'This is an assistant response',
    timestamp: new Date('2024-01-01T10:01:00Z'),
    metadata: {
      deviceId: 'test-device',
    },
  };

  test('应该正确渲染用户消息', () => {
    render(<ChatMessage message={mockMessage} />);
    
    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /复制/i })).toBeInTheDocument();
  });

  test('应该正确渲染助手消息', () => {
    render(<ChatMessage message={mockAssistantMessage} />);
    
    expect(screen.getByText('This is an assistant response')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /重新生成/i })).toBeInTheDocument();
  });

  test('应该支持消息编辑功能', async () => {
    const onRegenerate = jest.fn();
    render(<ChatMessage message={mockMessage} onRegenerate={onRegenerate} />);
    
    // 点击编辑按钮
    const editButton = screen.getByRole('button', { name: /编辑/i });
    fireEvent.click(editButton);
    
    // 验证编辑模式
    await waitFor(() => {
      expect(screen.getByDisplayValue('Hello, this is a test message')).toBeInTheDocument();
    });
    
    // 验证保存和取消按钮
    expect(screen.getByRole('button', { name: /保存/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /取消/i })).toBeInTheDocument();
  });

  test('应该支持消息复制功能', () => {
    const onCopy = jest.fn();
    render(<ChatMessage message={mockMessage} onCopy={onCopy} />);
    
    const copyButton = screen.getByRole('button', { name: /复制/i });
    fireEvent.click(copyButton);
    
    expect(onCopy).toHaveBeenCalled();
  });

  test('应该支持消息删除功能', () => {
    const onDelete = jest.fn();
    render(<ChatMessage message={mockMessage} onDelete={onDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /删除/i });
    fireEvent.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalledWith(mockMessage);
  });

  test('应该支持消息点赞功能', () => {
    const onLike = jest.fn();
    render(<ChatMessage message={mockAssistantMessage} onLike={onLike} />);
    
    const likeButton = screen.getByRole('button', { name: /点赞/i });
    fireEvent.click(likeButton);
    
    expect(onLike).toHaveBeenCalledWith(mockAssistantMessage);
  });

  test('应该支持消息点踩功能', () => {
    const onDislike = jest.fn();
    render(<ChatMessage message={mockAssistantMessage} onDislike={onDislike} />);
    
    const dislikeButton = screen.getByRole('button', { name: /点踩/i });
    fireEvent.click(dislikeButton);
    
    expect(onDislike).toHaveBeenCalledWith(mockAssistantMessage);
  });

  test('应该正确处理键盘事件', async () => {
    render(<ChatMessage message={mockMessage} />);
    
    // 进入编辑模式
    const editButton = screen.getByRole('button', { name: /编辑/i });
    fireEvent.click(editButton);
    
    await waitFor(() => {
      const textarea = screen.getByDisplayValue('Hello, this is a test message');
      
      // 测试 Escape 键取消编辑
      fireEvent.keyDown(textarea, { key: 'Escape' });
      
      // 验证编辑模式已退出
      expect(screen.queryByDisplayValue('Hello, this is a test message')).not.toBeInTheDocument();
    });
  });

  test('应该正确显示时间戳', () => {
    render(<ChatMessage message={mockMessage} />);
    
    // 验证时间戳显示
    expect(screen.getByText(/刚刚|分钟前|小时前/)).toBeInTheDocument();
  });

  test('应该正确处理空消息', () => {
    const emptyMessage = {
      ...mockMessage,
      content: '',
    };
    
    render(<ChatMessage message={emptyMessage} />);
    
    // 验证空消息的处理
    expect(screen.getByText('内容')).toBeInTheDocument();
  });
});
