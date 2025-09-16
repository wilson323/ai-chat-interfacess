/**
 * 统一聊天容器组件测试
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedChatContainer } from '@/components/chat/unified-chat-container';
import type { Message } from '@/types/chat';

// Mock依赖
jest.mock('@/context/thinking-context', () => ({
  ThinkingProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='thinking-provider'>{children}</div>
  ),
}));

jest.mock('@/components/chat/unified-message-list', () => ({
  UnifiedMessageList: ({ messages }: { messages: Message[] }) => (
    <div data-testid='message-list'>
      {messages.map(msg => (
        <div key={msg.id} data-testid={`message-${msg.id}`}>
          {msg.content}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/components/chat/unified-input', () => ({
  UnifiedInput: ({ value, onChange, onSend }: any) => (
    <div data-testid='unified-input'>
      <input
        data-testid='input-field'
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <button
        data-testid='send-button'
        onClick={() => onSend()}
        disabled={!value.trim()}
      >
        发送
      </button>
    </div>
  ),
}));

jest.mock('@/components/chat/unified-file-upload', () => ({
  UnifiedFileUpload: ({ onFileUpload }: any) => (
    <div data-testid='file-upload'>
      <button
        data-testid='upload-button'
        onClick={() => onFileUpload([new File(['test'], 'test.txt')])}
      >
        上传文件
      </button>
    </div>
  ),
}));

describe('UnifiedChatContainer', () => {
  const mockOnSendMessage = jest.fn();
  const mockOnEditMessage = jest.fn();
  const mockOnDeleteMessage = jest.fn();
  const mockOnRegenerateMessage = jest.fn();
  const mockOnCopyMessage = jest.fn();

  const defaultProps = {
    onSendMessage: mockOnSendMessage,
    onEditMessage: mockOnEditMessage,
    onDeleteMessage: mockOnDeleteMessage,
    onRegenerateMessage: mockOnRegenerateMessage,
    onCopyMessage: mockOnCopyMessage,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该渲染聊天容器', () => {
    render(<UnifiedChatContainer {...defaultProps} />);

    expect(screen.getByTestId('thinking-provider')).toBeInTheDocument();
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.getByTestId('unified-input')).toBeInTheDocument();
  });

  it('应该显示初始消息', () => {
    const initialMessages: Message[] = [
      {
        id: '1',
        content: 'Hello',
        role: 'user',
        timestamp: new Date(),
      },
      {
        id: '2',
        content: 'Hi there!',
        role: 'assistant',
        timestamp: new Date(),
      },
    ];

    render(
      <UnifiedChatContainer
        {...defaultProps}
        initialMessages={initialMessages}
      />
    );

    expect(screen.getByTestId('message-1')).toHaveTextContent('Hello');
    expect(screen.getByTestId('message-2')).toHaveTextContent('Hi there!');
  });

  it('应该处理消息发送', async () => {
    render(<UnifiedChatContainer {...defaultProps} />);

    const input = screen.getByTestId('input-field');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
    });
  });

  it('应该禁用发送按钮当输入为空时', () => {
    render(<UnifiedChatContainer {...defaultProps} />);

    const sendButton = screen.getByTestId('send-button');
    expect(sendButton).toBeDisabled();
  });

  it('应该启用文件上传功能', () => {
    render(<UnifiedChatContainer {...defaultProps} enableFileUpload={true} />);

    expect(screen.getByTestId('file-upload')).toBeInTheDocument();
  });

  it('应该禁用文件上传功能', () => {
    render(<UnifiedChatContainer {...defaultProps} enableFileUpload={false} />);

    expect(screen.queryByTestId('file-upload')).not.toBeInTheDocument();
  });

  it('应该处理文件上传', async () => {
    render(<UnifiedChatContainer {...defaultProps} />);

    const uploadButton = screen.getByTestId('upload-button');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      // 验证文件被添加到状态中
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });
  });
});
