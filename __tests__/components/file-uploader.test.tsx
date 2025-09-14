/**
 * FileUploader组件测试
 * 测试文件上传组件的功能
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUploader } from '@/components/file-uploader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/context/user-context';

// 测试包装器
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>{children}</AppProvider>
    </QueryClientProvider>
  );
};

// Mock文件对象
const createMockFile = (name: string, size: number, type: string) => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('FileUploader组件测试', () => {
  describe('基础渲染测试', () => {
    it('应该正确渲染文件上传组件', () => {
      render(
        <TestWrapper>
          <FileUploader onFileSelect={jest.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/upload/i)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('应该显示支持的文件类型', () => {
      render(
        <TestWrapper>
          <FileUploader onFileSelect={jest.fn()} accept=".pdf,.doc,.docx" />
        </TestWrapper>
      );

      expect(screen.getByText(/pdf|doc/i)).toBeInTheDocument();
    });
  });

  describe('文件选择功能测试', () => {
    it('应该正确处理文件选择', async () => {
      const onFileSelect = jest.fn();
      
      render(
        <TestWrapper>
          <FileUploader onFileSelect={onFileSelect} />
        </TestWrapper>
      );

      const file = createMockFile('test.txt', 1024, 'text/plain');
      const input = screen.getByRole('button');
      
      fireEvent.click(input);
      
      // 模拟文件选择
      const fileInput = screen.getByTestId('file-input');
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalledWith(file);
      });
    });

    it('应该处理多个文件选择', async () => {
      const onFileSelect = jest.fn();
      
      render(
        <TestWrapper>
          <FileUploader onFileSelect={onFileSelect} multiple />
        </TestWrapper>
      );

      const file1 = createMockFile('test1.txt', 1024, 'text/plain');
      const file2 = createMockFile('test2.txt', 2048, 'text/plain');
      
      const fileInput = screen.getByTestId('file-input');
      fireEvent.change(fileInput, { target: { files: [file1, file2] } });

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalledWith([file1, file2]);
      });
    });
  });

  describe('文件验证测试', () => {
    it('应该拒绝过大的文件', async () => {
      const onFileSelect = jest.fn();
      const onError = jest.fn();
      
      render(
        <TestWrapper>
          <FileUploader 
            onFileSelect={onFileSelect} 
            onError={onError}
            maxSize={1024} // 1KB
          />
        </TestWrapper>
      );

      const largeFile = createMockFile('large.txt', 2048, 'text/plain');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.stringContaining('too large'));
        expect(onFileSelect).not.toHaveBeenCalled();
      });
    });

    it('应该拒绝不支持的文件类型', async () => {
      const onFileSelect = jest.fn();
      const onError = jest.fn();
      
      render(
        <TestWrapper>
          <FileUploader 
            onFileSelect={onFileSelect} 
            onError={onError}
            accept=".txt,.pdf"
          />
        </TestWrapper>
      );

      const invalidFile = createMockFile('test.exe', 1024, 'application/x-executable');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.stringContaining('not supported'));
        expect(onFileSelect).not.toHaveBeenCalled();
      });
    });
  });

  describe('拖拽上传测试', () => {
    it('应该支持拖拽上传', async () => {
      const onFileSelect = jest.fn();
      
      render(
        <TestWrapper>
          <FileUploader onFileSelect={onFileSelect} />
        </TestWrapper>
      );

      const dropZone = screen.getByTestId('drop-zone');
      const file = createMockFile('test.txt', 1024, 'text/plain');

      // 模拟拖拽事件
      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalledWith(file);
      });
    });

    it('应该显示拖拽状态', () => {
      render(
        <TestWrapper>
          <FileUploader onFileSelect={jest.fn()} />
        </TestWrapper>
      );

      const dropZone = screen.getByTestId('drop-zone');
      
      fireEvent.dragOver(dropZone);
      expect(dropZone).toHaveClass('drag-over');
      
      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass('drag-over');
    });
  });

  describe('上传进度测试', () => {
    it('应该显示上传进度', async () => {
      const onFileSelect = jest.fn();
      
      render(
        <TestWrapper>
          <FileUploader onFileSelect={onFileSelect} showProgress />
        </TestWrapper>
      );

      const file = createMockFile('test.txt', 1024, 'text/plain');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });
  });

  describe('错误处理测试', () => {
    it('应该处理文件读取错误', async () => {
      const onError = jest.fn();
      
      render(
        <TestWrapper>
          <FileUploader onFileSelect={jest.fn()} onError={onError} />
        </TestWrapper>
      );

      // 创建一个无法读取的文件对象
      const invalidFile = createMockFile('test.txt', 1024, 'text/plain');
      Object.defineProperty(invalidFile, 'name', {
        get: () => { throw new Error('File read error'); }
      });

      const fileInput = screen.getByTestId('file-input');
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.stringContaining('File read error'));
      });
    });
  });
});

