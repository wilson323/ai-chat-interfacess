/**
 * ConfirmDialog组件测试
 * 测试确认对话框的功能
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/context/user-context';

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

describe('ConfirmDialog组件测试', () => {
  describe('基础渲染测试', () => {
    it('应该正确渲染确认对话框', () => {
      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('确认操作')).toBeInTheDocument();
    });

    it('应该显示自定义标题和内容', () => {
      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            title='删除确认'
            content='确定要删除这个项目吗？'
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText('删除确认')).toBeInTheDocument();
      expect(screen.getByText('确定要删除这个项目吗？')).toBeInTheDocument();
    });

    it('应该显示自定义按钮文本', () => {
      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            confirmText='删除'
            cancelText='取消'
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText('删除')).toBeInTheDocument();
      expect(screen.getByText('取消')).toBeInTheDocument();
    });
  });

  describe('交互功能测试', () => {
    it('应该处理确认操作', () => {
      const onConfirm = jest.fn();

      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            onOpenChange={jest.fn()}
            onConfirm={onConfirm}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      const confirmButton = screen.getByText('确认');
      fireEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalled();
    });

    it('应该处理取消操作', () => {
      const onCancel = jest.fn();

      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={onCancel}
          />
        </TestWrapper>
      );

      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it('应该处理对话框关闭', () => {
      const onOpenChange = jest.fn();

      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            onOpenChange={onOpenChange}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      // 点击关闭按钮
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('应该支持ESC键关闭', () => {
      const onOpenChange = jest.fn();

      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            onOpenChange={onOpenChange}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('状态管理测试', () => {
    it('应该在关闭状态下不渲染对话框', () => {
      render(
        <TestWrapper>
          <ConfirmDialog
            open={false}
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('应该显示加载状态', () => {
      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            loading={true}
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('确认')).toBeDisabled();
    });

    it('应该禁用取消按钮', () => {
      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            disableCancel={true}
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText('取消')).toBeDisabled();
    });

    it('应该禁用确认按钮', () => {
      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            disableConfirm={true}
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText('确认')).toBeDisabled();
    });
  });

  describe('样式和主题测试', () => {
    it('应该应用自定义样式类', () => {
      const { container } = render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            className='custom-dialog'
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      expect(container.querySelector('.custom-dialog')).toBeInTheDocument();
    });

    it('应该支持危险操作样式', () => {
      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            variant='destructive'
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      const confirmButton = screen.getByText('确认');
      expect(confirmButton).toHaveClass('destructive');
    });

    it('应该支持不同尺寸', () => {
      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            size='large'
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('large');
    });
  });

  describe('可访问性测试', () => {
    it('应该有正确的ARIA标签', () => {
      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            title='删除确认'
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('应该支持焦点管理', () => {
      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      const confirmButton = screen.getByText('确认');
      expect(confirmButton).toHaveFocus();
    });

    it('应该支持键盘导航', () => {
      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            onOpenChange={jest.fn()}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      const confirmButton = screen.getByText('确认');

      // Tab键应该移动到取消按钮
      fireEvent.keyDown(confirmButton, { key: 'Tab' });

      const cancelButton = screen.getByText('取消');
      expect(cancelButton).toHaveFocus();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空的回调函数', () => {
      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            onOpenChange={jest.fn()}
            onConfirm={undefined as any}
            onCancel={undefined as any}
          />
        </TestWrapper>
      );

      const confirmButton = screen.getByText('确认');
      const cancelButton = screen.getByText('取消');

      // 应该不会抛出错误
      expect(() => fireEvent.click(confirmButton)).not.toThrow();
      expect(() => fireEvent.click(cancelButton)).not.toThrow();
    });

    it('应该处理异步确认操作', async () => {
      const onConfirm = jest.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            onOpenChange={jest.fn()}
            onConfirm={onConfirm}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      const confirmButton = screen.getByText('确认');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });

    it('应该处理确认操作错误', async () => {
      const onConfirm = jest
        .fn()
        .mockRejectedValue(new Error('Operation failed'));

      render(
        <TestWrapper>
          <ConfirmDialog
            open={true}
            onOpenChange={jest.fn()}
            onConfirm={onConfirm}
            onCancel={jest.fn()}
          />
        </TestWrapper>
      );

      const confirmButton = screen.getByText('确认');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('操作失败')).toBeInTheDocument();
      });
    });
  });
});
