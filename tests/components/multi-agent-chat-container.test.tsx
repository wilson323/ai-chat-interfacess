/**
 * 多智能体聊天容器组件测试
 * 测试组件渲染、状态管理、用户交互
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MultiAgentChatContainer } from '@/components/chat/MultiAgentChatContainer';
import { createMockAgentContext } from '@/lib/test-utils';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock agent context
jest.mock('@/context/agent-context', () => ({
  useAgent: jest.fn(() => createMockAgentContext()),
}));

// Mock unified agent manager
jest.mock('@/lib/api/unified-agent-manager', () => ({
  UnifiedAgentManager: jest.fn().mockImplementation(() => ({
    getAllAgents: jest.fn().mockReturnValue([
      {
        config: {
          id: 'agent-1',
          name: 'Test Agent 1',
          description: 'First test agent',
          isActive: true,
        },
        metrics: {
          requestCount: 10,
          successfulRequests: 8,
          failedRequests: 2,
          averageResponseTime: 1500,
        },
      },
      {
        config: {
          id: 'agent-2',
          name: 'Test Agent 2',
          description: 'Second test agent',
          isActive: true,
        },
        metrics: {
          requestCount: 5,
          successfulRequests: 5,
          failedRequests: 0,
          averageResponseTime: 1200,
        },
      },
    ]),
    selectBestAgent: jest.fn().mockReturnValue({
      config: {
        id: 'agent-1',
        name: 'Test Agent 1',
        description: 'First test agent',
        isActive: true,
      },
    }),
    chat: jest.fn().mockResolvedValue({
      success: true,
      data: {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you today?',
            },
          },
        ],
      },
    }),
    streamChat: jest.fn().mockResolvedValue({
      success: true,
    }),
  })),
}));

// Mock chat hooks
jest.mock('@/hooks/useChat', () => ({
  useChat: () => ({
    messages: [
      {
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      },
    ],
    isLoading: false,
    error: null,
    sendMessage: jest.fn(),
    clearMessages: jest.fn(),
  }),
}));

// Mock agent context
jest.mock('@/context/agent-context', () => ({
  useAgentContext: () => ({
    selectedAgent: {
      id: 'agent-1',
      name: 'Test Agent 1',
    },
    setSelectedAgent: jest.fn(),
  }),
}));

describe('MultiAgentChatContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('应该正确渲染组件', () => {
    render(<MultiAgentChatContainer />);

    expect(screen.getByText('Multi-Agent Chat')).toBeInTheDocument();
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
  });

  test('应该显示智能体列表', () => {
    render(<MultiAgentChatContainer />);

    // 检查智能体名称
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument();

    // 检查智能体描述
    expect(screen.getByText('First test agent')).toBeInTheDocument();
    expect(screen.getByText('Second test agent')).toBeInTheDocument();
  });

  test('应该显示智能体指标', () => {
    render(<MultiAgentChatContainer />);

    // 检查请求数量
    expect(screen.getByText('10')).toBeInTheDocument(); // agent-1 requestCount
    expect(screen.getByText('5')).toBeInTheDocument();  // agent-2 requestCount

    // 检查成功率
    expect(screen.getByText('80%')).toBeInTheDocument(); // agent-1 success rate
    expect(screen.getByText('100%')).toBeInTheDocument(); // agent-2 success rate
  });

  test('应该能够选择智能体', async () => {
    render(<MultiAgentChatContainer />);

    const agent2Button = screen.getByText('Test Agent 2');
    fireEvent.click(agent2Button);

    // 验证选择逻辑（这里需要根据实际实现调整）
    await waitFor(() => {
      expect(agent2Button).toHaveClass('selected'); // 假设有selected类
    });
  });

  test('应该能够发送消息', async () => {
    render(<MultiAgentChatContainer />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    fireEvent.click(sendButton);

    // 验证消息发送逻辑
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  test('应该显示加载状态', () => {
    // Mock loading state
    jest.doMock('@/hooks/useChat', () => ({
      useChat: () => ({
        messages: [],
        isLoading: true,
        error: null,
        sendMessage: jest.fn(),
        clearMessages: jest.fn(),
      }),
    }));

    render(<MultiAgentChatContainer />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('应该显示错误状态', () => {
    // Mock error state
    jest.doMock('@/hooks/useChat', () => ({
      useChat: () => ({
        messages: [],
        isLoading: false,
        error: 'Connection failed',
        sendMessage: jest.fn(),
        clearMessages: jest.fn(),
      }),
    }));

    render(<MultiAgentChatContainer />);

    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  test('应该能够切换智能体模式', () => {
    render(<MultiAgentChatContainer />);

    const modeToggle = screen.getByText('Auto Select');
    fireEvent.click(modeToggle);

    // 验证模式切换逻辑
    expect(screen.getByText('Manual Select')).toBeInTheDocument();
  });

  test('应该显示智能体状态指示器', () => {
    render(<MultiAgentChatContainer />);

    // 检查在线状态指示器
    const statusIndicators = screen.getAllByTestId('agent-status');
    expect(statusIndicators).toHaveLength(2);
  });
});
