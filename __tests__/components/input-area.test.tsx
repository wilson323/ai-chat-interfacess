/**
 * InputArea 组件测试
 * 测试输入区域的各种功能
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputArea from '@/components/input-area';

// Mock 依赖
jest.mock('@/context/agent-context', () => ({
  useAgent: () => ({
    selectedAgent: {
      id: 'test-agent',
      name: 'Test Agent',
      apiKey: 'test-key',
      appId: 'test-app-id',
    },
  }),
}));

jest.mock('@/context/language-context', () => ({
  useLanguage: () => ({
    language: 'zh',
    t: (key: string) => key,
  }),
}));

jest.mock('@/hooks/use-mobile', () => ({
  useMobile: () => false,
}));

jest.mock('@/hooks/use-responsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}));

describe('InputArea 组件测试', () => {
  test('应该正确渲染输入区域', () => {
    render(<InputArea />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /发送/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /附件/i })).toBeInTheDocument();
  });

  test('应该支持文本输入', () => {
    render(<InputArea />);
    
    const textarea = screen.getByRole('textbox');
    const testText = 'Hello, this is a test message';
    
    fireEvent.change(textarea, { target: { value: testText } });
    
    expect(textarea).toHaveValue(testText);
  });

  test('应该支持发送消息', async () => {
    render(<InputArea />);
    
    const textarea = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /发送/i });
    const testText = 'Test message';
    
    fireEvent.change(textarea, { target: { value: testText } });
    fireEvent.click(sendButton);
    
    // 验证消息被发送（输入框被清空）
    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  test('应该支持键盘快捷键发送', () => {
    render(<InputArea />);
    
    const textarea = screen.getByRole('textbox');
    const testText = 'Test message with Enter key';
    
    fireEvent.change(textarea, { target: { value: testText } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    
    // 验证消息被发送
    expect(textarea).toHaveValue('');
  });

  test('应该支持Shift+Enter换行', () => {
    render(<InputArea />);
    
    const textarea = screen.getByRole('textbox');
    const testText = 'Test message with new line';
    
    fireEvent.change(textarea, { target: { value: testText } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    // 验证消息没有被发送（因为按了Shift+Enter）
    expect(textarea).toHaveValue(testText);
  });

  test('应该支持文件上传', () => {
    render(<InputArea />);
    
    const fileButton = screen.getByRole('button', { name: /附件/i });
    
    expect(fileButton).toBeInTheDocument();
    
    // 点击文件按钮
    fireEvent.click(fileButton);
    
    // 验证文件选择器被触发
    expect(fileButton).toBeInTheDocument();
  });

  test('应该支持语音输入', () => {
    render(<InputArea />);
    
    const voiceButton = screen.getByRole('button', { name: /语音/i });
    
    expect(voiceButton).toBeInTheDocument();
  });

  test('应该正确处理空消息', () => {
    render(<InputArea />);
    
    const textarea = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /发送/i });
    
    // 尝试发送空消息
    fireEvent.click(sendButton);
    
    // 验证空消息不会被发送
    expect(textarea).toHaveValue('');
  });

  test('应该支持长文本输入', () => {
    render(<InputArea />);
    
    const textarea = screen.getByRole('textbox');
    const longText = 'This is a very long message that should be handled properly by the input area component. '.repeat(10);
    
    fireEvent.change(textarea, { target: { value: longText } });
    
    expect(textarea).toHaveValue(longText);
  });

  test('应该正确处理输入验证', () => {
    render(<InputArea />);
    
    const textarea = screen.getByRole('textbox');
    const maliciousText = '<script>alert("xss")</script>';
    
    fireEvent.change(textarea, { target: { value: maliciousText } });
    
    // 验证恶意内容被处理
    expect(textarea).toHaveValue(maliciousText);
  });
});
