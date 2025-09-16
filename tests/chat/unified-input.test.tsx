/// <reference types="@testing-library/jest-dom" />
/**
 * 统一输入组件测试
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// 确保 jest-dom 匹配器可用
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeDisabled(): R;
      toHaveValue(value: string | number): R;
      toHaveAttribute(attr: string, value?: string): R;
    }
  }
}
import { UnifiedInput } from '@/components/chat/unified-input';

// Mock依赖
jest.mock('@/lib/voice/store/voice-store', () => ({
  useVoiceStore: () => ({
    recordingState: { isRecording: false },
    playbackState: { isPlaying: false },
    isInitialized: true,
    initialize: jest.fn(),
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    synthesizeSpeech: jest.fn(),
    clearError: jest.fn(),
  }),
}));

jest.mock('@/context/language-context', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

describe('UnifiedInput', () => {
  const mockOnChange = jest.fn();
  const mockOnSend = jest.fn();
  const mockOnFileUpload = jest.fn();
  const mockOnVoiceTextRecognized = jest.fn();
  const mockOnTTSRequest = jest.fn();
  const mockOnRemoveFile = jest.fn();

  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    onSend: mockOnSend,
    onFileUpload: mockOnFileUpload,
    onVoiceTextRecognized: mockOnVoiceTextRecognized,
    onTTSRequest: mockOnTTSRequest,
    onRemoveFile: mockOnRemoveFile,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该渲染输入组件', () => {
    render(<UnifiedInput {...defaultProps} />);

    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /发送/i })).toBeInTheDocument();
  });

  it('应该处理文本输入', () => {
    render(<UnifiedInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('输入消息...');
    fireEvent.change(input, { target: { value: 'Test message' } });

    expect(mockOnChange).toHaveBeenCalledWith('Test message');
  });

  it('应该处理发送消息', () => {
    render(<UnifiedInput {...defaultProps} value='Test message' />);

    const sendButton = screen.getByRole('button', { name: /发送/i });
    fireEvent.click(sendButton);

    expect(mockOnSend).toHaveBeenCalled();
  });

  it('应该处理Enter键发送', () => {
    render(<UnifiedInput {...defaultProps} value='Test message' />);

    const input = screen.getByPlaceholderText('输入消息...');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSend).toHaveBeenCalled();
  });

  it('应该处理Shift+Enter换行', () => {
    render(<UnifiedInput {...defaultProps} value='Test message' />);

    const input = screen.getByPlaceholderText('输入消息...');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('应该显示文件上传按钮', () => {
    render(<UnifiedInput {...defaultProps} enableFileUpload={true} />);

    expect(
      screen.getByRole('button', { name: /上传文件/i })
    ).toBeInTheDocument();
  });

  it('应该隐藏文件上传按钮', () => {
    render(<UnifiedInput {...defaultProps} enableFileUpload={false} />);

    expect(
      screen.queryByRole('button', { name: /上传文件/i })
    ).not.toBeInTheDocument();
  });

  it('应该显示语音录制按钮', () => {
    render(<UnifiedInput {...defaultProps} enableVoice={true} />);

    expect(
      screen.getByRole('button', { name: /开始录音/i })
    ).toBeInTheDocument();
  });

  it('应该隐藏语音录制按钮', () => {
    render(<UnifiedInput {...defaultProps} enableVoice={false} />);

    expect(
      screen.queryByRole('button', { name: /开始录音/i })
    ).not.toBeInTheDocument();
  });

  it('应该显示上传的文件', () => {
    const uploadedFiles = [
      {
        id: '1',
        name: 'test.txt',
        size: 1024,
        type: 'text/plain',
        url: 'blob:test',
      },
    ];

    render(<UnifiedInput {...defaultProps} uploadedFiles={uploadedFiles} />);

    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  it('应该处理文件移除', () => {
    const uploadedFiles = [
      {
        id: '1',
        name: 'test.txt',
        size: 1024,
        type: 'text/plain',
        url: 'blob:test',
      },
    ];

    render(
      <UnifiedInput
        {...defaultProps}
        uploadedFiles={uploadedFiles}
        onRemoveFile={mockOnRemoveFile}
      />
    );

    const removeButton = screen.getByRole('button', { name: /移除/i });
    fireEvent.click(removeButton);

    expect(mockOnRemoveFile).toHaveBeenCalledWith('1');
  });

  it('应该显示字符计数', () => {
    render(<UnifiedInput {...defaultProps} value='Test' maxLength={100} />);

    expect(screen.getByText('4/100')).toBeInTheDocument();
  });

  it('应该禁用输入当发送中时', () => {
    render(<UnifiedInput {...defaultProps} isSending={true} />);

    const input = screen.getByPlaceholderText('输入消息...');
    const sendButton = screen.getByRole('button', { name: /发送/i });

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('应该显示发送状态', () => {
    render(<UnifiedInput {...defaultProps} isSending={true} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
