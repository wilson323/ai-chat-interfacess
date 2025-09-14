/**
 * ChatMessage组件测试
 * 测试聊天消息组件的渲染和交互功能
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatMessage } from '@/components/chat-message';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/context/user-context';

// 测试数据
const mockMessage = {
  id: '1',
  content: 'Hello, world!',
  role: 'user' as const,
  timestamp: new Date().toISOString(),
  agentId: 'test-agent',
};

const mockAgentMessage = {
  id: '2',
  content: 'Hi there!',
  role: 'assistant' as const,
  timestamp: new Date().toISOString(),
  agentId: 'test-agent',
};

// 测试包装器
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>{children}</AppProvider>
    </QueryClientProvider>
  );
};

describe('ChatMessage组件测试', () => {
  describe('基础渲染测试', () => {
    it('应该正确渲染用户消息', () => {
      render(
        <TestWrapper>
          <ChatMessage message={mockMessage} />
        </TestWrapper>
      );

      expect(screen.getByText('Hello, world!')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
    });

    it('应该正确渲染助手消息', () => {
      render(
        <TestWrapper>
          <ChatMessage message={mockAgentMessage} />
        </TestWrapper>
      );

      expect(screen.getByText('Hi there!')).toBeInTheDocument();
      expect(screen.getByText('assistant')).toBeInTheDocument();
    });

    it('应该显示时间戳', () => {
      render(
        <TestWrapper>
          <ChatMessage message={mockMessage} />
        </TestWrapper>
      );

      // 检查时间戳是否存在（具体格式可能不同）
      expect(screen.getByText(/\d{4}-\d{2}-\d{2}/)).toBeInTheDocument();
    });
  });

  describe('交互功能测试', () => {
    it('应该支持消息复制功能', () => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockImplementation(() => Promise.resolve()),
        },
      });

      render(
        <TestWrapper>
          <ChatMessage message={mockMessage} />
        </TestWrapper>
      );

      // 查找复制按钮并点击
      const copyButton = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Hello, world!'
      );
    });

    it('应该支持消息删除功能', () => {
      const onDelete = jest.fn();

      render(
        <TestWrapper>
          <ChatMessage message={mockMessage} onDelete={onDelete} />
        </TestWrapper>
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('样式和布局测试', () => {
    it('用户消息应该有正确的样式类', () => {
      const { container } = render(
        <TestWrapper>
          <ChatMessage message={mockMessage} />
        </TestWrapper>
      );

      const messageElement = container.querySelector('.user-message');
      expect(messageElement).toBeInTheDocument();
    });

    it('助手消息应该有正确的样式类', () => {
      const { container } = render(
        <TestWrapper>
          <ChatMessage message={mockAgentMessage} />
        </TestWrapper>
      );

      const messageElement = container.querySelector('.assistant-message');
      expect(messageElement).toBeInTheDocument();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空消息内容', () => {
      const emptyMessage = { ...mockMessage, content: '' };

      render(
        <TestWrapper>
          <ChatMessage message={emptyMessage} />
        </TestWrapper>
      );

      expect(screen.getByText('user')).toBeInTheDocument();
    });

    it('应该处理长消息内容', () => {
      const longMessage = {
        ...mockMessage,
        content: 'A'.repeat(1000),
      };

      render(
        <TestWrapper>
          <ChatMessage message={longMessage} />
        </TestWrapper>
      );

      expect(screen.getByText(/A{100}/)).toBeInTheDocument();
    });

    it('应该处理特殊字符消息', () => {
      const specialMessage = {
        ...mockMessage,
        content: '<script>alert("test")</script>',
      };

      render(
        <TestWrapper>
          <ChatMessage message={specialMessage} />
        </TestWrapper>
      );

      // 应该转义HTML字符
      expect(screen.getByText(/&lt;script&gt;/)).toBeInTheDocument();
    });
  });
});
