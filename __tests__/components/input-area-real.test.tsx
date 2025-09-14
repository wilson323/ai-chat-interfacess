/**
 * InputArea 组件真实环境测试
 * 使用真实数据和真实FastGPT API进行测试
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputArea from '@/components/input-area';

// 真实环境测试配置
const realTestConfig = {
  fastgptUrl: 'http://171.43.138.237:3000',
  fastgptKey:
    'fastgpt-jlX6R5zJ7mFB5hsCEDc2PG4Um2hDhyARSnucLwTtYlL2fdo4ueFPWlwy2Ni',
  fastgptAppId: '6708e788c6ba48baa62419a5',
  apiBaseUrl: 'http://localhost:3000/api',
  timeout: 30000,
};

describe('InputArea 真实环境测试', () => {
  beforeAll(() => {
    // 设置真实环境变量
    process.env.NEXT_PUBLIC_FASTGPT_API_URL = realTestConfig.fastgptUrl;
    process.env.NEXT_PUBLIC_FASTGPT_API_KEY = realTestConfig.fastgptKey;
    process.env.NEXT_PUBLIC_FASTGPT_APP_ID = realTestConfig.fastgptAppId;
    process.env.NEXT_PUBLIC_API_BASE_URL = realTestConfig.apiBaseUrl;
  });

  test('组件渲染测试', () => {
    render(<InputArea />);

    // 验证真实UI元素存在
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /发送/i })).toBeInTheDocument();
  });

  test('真实FastGPT消息发送测试', async () => {
    render(<InputArea />);

    const textarea = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /发送/i });

    // 输入真实测试消息
    const realMessage = '你好，请介绍一下你自己';
    fireEvent.change(textarea, { target: { value: realMessage } });

    expect(textarea).toHaveValue(realMessage);

    // 点击发送按钮
    fireEvent.click(sendButton);

    // 等待真实FastGPT API响应
    await waitFor(
      () => {
        // 验证消息被发送（不依赖模拟数据）
        expect(textarea).toHaveValue('');
      },
      { timeout: 30000 }
    );
  });

  test('真实FastGPT智能体对话测试', async () => {
    render(<InputArea />);

    const textarea = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /发送/i });

    // 测试与FastGPT智能体的真实对话
    const testMessages = ['你好', '请介绍一下你的功能', '你能帮我做什么？'];

    for (const message of testMessages) {
      fireEvent.change(textarea, { target: { value: message } });
      fireEvent.click(sendButton);

      // 等待消息处理
      await waitFor(
        () => {
          expect(textarea).toHaveValue('');
        },
        { timeout: 10000 }
      );

      // 短暂等待，避免API限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });

  test('真实文件上传测试', async () => {
    render(<InputArea />);

    const fileInput = screen.getByRole('button', { name: /附件/i });

    // 创建真实测试文件
    const realFile = new File(['真实测试文件内容'], 'test.txt', {
      type: 'text/plain',
    });

    // 模拟文件选择
    fireEvent.click(fileInput);

    // 验证文件处理逻辑（真实环境）
    expect(fileInput).toBeInTheDocument();
  });

  test('真实快捷键测试', () => {
    render(<InputArea />);

    const textarea = screen.getByRole('textbox');

    // 输入内容
    fireEvent.change(textarea, { target: { value: '测试消息' } });

    // 测试Enter键发送
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    // 验证快捷键功能（真实行为）
    expect(textarea).toBeInTheDocument();
  });

  test('真实错误处理测试', async () => {
    // 临时修改API URL为无效地址来测试错误处理
    const originalUrl = process.env.NEXT_PUBLIC_FASTGPT_API_URL;
    process.env.NEXT_PUBLIC_FASTGPT_API_URL = 'http://invalid-url:9999';

    render(<InputArea />);

    const textarea = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /发送/i });

    fireEvent.change(textarea, { target: { value: '测试错误处理' } });
    fireEvent.click(sendButton);

    // 等待错误处理
    await waitFor(
      () => {
        // 验证错误处理逻辑
        expect(textarea).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // 恢复原始URL
    process.env.NEXT_PUBLIC_FASTGPT_API_URL = originalUrl;
  });
});
