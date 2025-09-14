/**
 * VoiceButton组件测试
 * 测试语音按钮组件的功能
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoiceButton } from '@/components/voice/VoiceButton';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/context/user-context';

// Mock语音相关API
const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  state: 'inactive',
};

const mockMediaStream = {
  getTracks: jest.fn(() => []),
  getAudioTracks: jest.fn(() => []),
  getVideoTracks: jest.fn(() => []),
};

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(() => Promise.resolve(mockMediaStream)),
  },
});

// Mock MediaRecorder
global.MediaRecorder = jest
  .fn()
  .mockImplementation(() => mockMediaRecorder) as any;

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

describe('VoiceButton组件测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基础渲染测试', () => {
    it('应该正确渲染语音按钮', () => {
      render(
        <TestWrapper>
          <VoiceButton onTranscript={jest.fn()} />
        </TestWrapper>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByTestId('voice-button')).toBeInTheDocument();
    });

    it('应该显示麦克风图标', () => {
      render(
        <TestWrapper>
          <VoiceButton onTranscript={jest.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('microphone-icon')).toBeInTheDocument();
    });

    it('应该支持自定义样式', () => {
      render(
        <TestWrapper>
          <VoiceButton onTranscript={jest.fn()} className='custom-class' />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('语音录制功能测试', () => {
    it('应该开始语音录制', async () => {
      const onTranscript = jest.fn();

      render(
        <TestWrapper>
          <VoiceButton onTranscript={onTranscript} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
          audio: true,
        });
      });
    });

    it('应该停止语音录制', async () => {
      const onTranscript = jest.fn();

      render(
        <TestWrapper>
          <VoiceButton onTranscript={onTranscript} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');

      // 开始录制
      fireEvent.click(button);
      await waitFor(() => {
        expect(mockMediaRecorder.start).toHaveBeenCalled();
      });

      // 停止录制
      fireEvent.click(button);
      await waitFor(() => {
        expect(mockMediaRecorder.stop).toHaveBeenCalled();
      });
    });

    it('应该显示录制状态', async () => {
      render(
        <TestWrapper>
          <VoiceButton onTranscript={jest.fn()} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');

      // 开始录制
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveClass('recording');
        expect(screen.getByTestId('recording-indicator')).toBeInTheDocument();
      });
    });
  });

  describe('权限处理测试', () => {
    it('应该处理权限被拒绝的情况', async () => {
      const onError = jest.fn();
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(
        new Error('Permission denied')
      );

      render(
        <TestWrapper>
          <VoiceButton onTranscript={jest.fn()} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.stringContaining('Permission denied')
        );
      });
    });

    it('应该处理浏览器不支持的情况', async () => {
      const onError = jest.fn();
      // Mock不支持MediaRecorder
      (global as any).MediaRecorder = undefined;

      render(
        <TestWrapper>
          <VoiceButton onTranscript={jest.fn()} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.stringContaining('not supported')
        );
      });
    });
  });

  describe('音频处理测试', () => {
    it('应该处理音频数据', async () => {
      const onTranscript = jest.fn();
      const mockBlob = new Blob(['audio data'], { type: 'audio/wav' });

      // Mock音频处理事件
      mockMediaRecorder.addEventListener.mockImplementation(
        (event, callback) => {
          if (event === 'dataavailable') {
            setTimeout(() => callback({ data: mockBlob }), 100);
          }
        }
      );

      render(
        <TestWrapper>
          <VoiceButton onTranscript={onTranscript} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockMediaRecorder.addEventListener).toHaveBeenCalledWith(
          'dataavailable',
          expect.any(Function)
        );
      });
    });

    it('应该显示音频波形', async () => {
      render(
        <TestWrapper>
          <VoiceButton onTranscript={jest.fn()} showWaveform />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('audio-waveform')).toBeInTheDocument();
      });
    });
  });

  describe('状态管理测试', () => {
    it('应该正确管理录制状态', async () => {
      render(
        <TestWrapper>
          <VoiceButton onTranscript={jest.fn()} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');

      // 初始状态
      expect(button).not.toHaveClass('recording');

      // 开始录制
      fireEvent.click(button);
      await waitFor(() => {
        expect(button).toHaveClass('recording');
      });

      // 停止录制
      fireEvent.click(button);
      await waitFor(() => {
        expect(button).not.toHaveClass('recording');
      });
    });

    it('应该处理录制错误', async () => {
      const onError = jest.fn();
      mockMediaRecorder.start.mockImplementation(() => {
        throw new Error('Recording failed');
      });

      render(
        <TestWrapper>
          <VoiceButton onTranscript={jest.fn()} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.stringContaining('Recording failed')
        );
      });
    });
  });

  describe('可访问性测试', () => {
    it('应该有正确的ARIA标签', () => {
      render(
        <TestWrapper>
          <VoiceButton onTranscript={jest.fn()} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('应该在录制时更新ARIA状态', async () => {
      render(
        <TestWrapper>
          <VoiceButton onTranscript={jest.fn()} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });
});
