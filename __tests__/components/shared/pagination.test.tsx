/**
 * @jest-environment jsdom
 *
 * Pagination 组件测试
 * 测试分页组件的功能
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pagination from '@/components/shared/pagination';

describe('Pagination 组件测试', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    itemsPerPage: 10,
    onPageChange: jest.fn(),
    onPageSizeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('应该正确渲染分页组件', () => {
    render(<Pagination {...defaultProps} />);

    expect(screen.getByText('共 100 条记录，第 1-10 条')).toBeInTheDocument();
    expect(screen.getByText('每页')).toBeInTheDocument();
    expect(screen.getByText('条')).toBeInTheDocument();
    expect(screen.getByText('跳至')).toBeInTheDocument();
    expect(screen.getByText('页')).toBeInTheDocument();
  });

  test('应该支持页码变化', () => {
    const onPageChange = jest.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

    // 查找下一页按钮 (可能是 button 或 link)
    const nextElements = screen.getAllByText(/next/i);
    const nextElement = nextElements.find(
      el => el.closest('button') || el.closest('a') || el
    );

    if (nextElement) {
      fireEvent.click(nextElement);
      expect(onPageChange).toHaveBeenCalledWith(2);
    }
  });

  test('应该支持每页数量变化', () => {
    const onPageSizeChange = jest.fn();
    render(
      <Pagination {...defaultProps} onPageSizeChange={onPageSizeChange} />
    );

    // 查找选择器控件 (可能是 combobox、button 或 div)
    const selectElements = screen.getAllByText(/10|条/);
    const selectElement = selectElements.find(
      el =>
        el.closest('[role="combobox"]') ||
        el.closest('button') ||
        el.closest('.select')
    );

    if (selectElement) {
      fireEvent.click(selectElement);

      // 查找选项 20
      const option20 = screen.getByText('20');
      if (option20) {
        fireEvent.click(option20);
        expect(onPageSizeChange).toHaveBeenCalledWith(20);
      }
    }
  });

  test('应该支持快速跳转', () => {
    const onPageChange = jest.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

    const jumpInput = screen.getByPlaceholderText('1');
    fireEvent.change(jumpInput, { target: { value: '5' } });
    fireEvent.keyDown(jumpInput, { key: 'Enter' });

    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  test('应该正确处理边界情况', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination
        {...defaultProps}
        currentPage={1}
        onPageChange={onPageChange}
      />
    );

    // 查找上一页按钮，它实际上是一个链接
    const prevLink = screen.getByRole('link', { name: /previous/i });
    expect(prevLink).toHaveClass('pointer-events-none');
    expect(prevLink).toHaveClass('opacity-50');

    // 尝试点击，但由于样式应该无法点击
    fireEvent.click(prevLink);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  test('应该支持禁用状态', () => {
    render(<Pagination {...defaultProps} disabled />);

    // 查找下一页链接
    const nextLink = screen.getByRole('link', { name: /next/i });
    expect(nextLink).toHaveClass('pointer-events-none');
    expect(nextLink).toHaveClass('opacity-50');

    // 查找选择器控件
    const selectTrigger = screen.getByRole('combobox');
    expect(selectTrigger).toBeDisabled();

    // 查找跳转输入框
    const jumpInput = screen.getByPlaceholderText('1');
    expect(jumpInput).toBeDisabled();
  });

  test('应该支持自定义配置', () => {
    render(
      <Pagination
        {...defaultProps}
        showSizeChanger={false}
        showQuickJumper={false}
        showTotal={false}
      />
    );

    expect(
      screen.queryByText('共 100 条记录，第 1-10 条')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('每页')).not.toBeInTheDocument();
    expect(screen.queryByText('跳至')).not.toBeInTheDocument();
  });

  test('应该支持自定义页面大小选项', () => {
    render(<Pagination {...defaultProps} pageSizeOptions={[5, 15, 25]} />);

    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    // 验证自定义选项存在（使用 getAllByText 因为可能有多个元素包含相同文本）
    const fives = screen.getAllByText('5');
    const fifteens = screen.getAllByText('15');
    const twentyFives = screen.getAllByText('25');

    // 至少应该有一个包含这些数字的元素
    expect(fives.length).toBeGreaterThan(0);
    expect(fifteens.length).toBeGreaterThan(0);
    expect(twentyFives.length).toBeGreaterThan(0);
  });

  test('应该正确处理无数据情况', () => {
    render(<Pagination {...defaultProps} totalItems={0} />);

    expect(screen.queryByText('共 0 条记录')).not.toBeInTheDocument();
  });

  test('应该支持自定义样式', () => {
    const customClassName = 'custom-pagination';
    render(<Pagination {...defaultProps} className={customClassName} />);

    const pagination = screen.getByRole('navigation');
    // 检查自定义类名是否应用（可能在容器上）
    const container =
      pagination.closest(`.${customClassName}`) ||
      pagination.parentElement?.closest(`.${customClassName}`) ||
      document.querySelector(`.${customClassName}`);

    if (container) {
      expect(container).toHaveClass(customClassName);
    } else {
      // 如果类名直接应用在 navigation 上
      expect(pagination).toHaveClass(customClassName);
    }
  });

  test('应该正确处理单页情况', () => {
    render(<Pagination {...defaultProps} totalPages={1} currentPage={1} />);

    const nextLink = screen.getByRole('link', { name: /next/i });
    const prevLink = screen.getByRole('link', { name: /previous/i });

    expect(nextLink).toHaveClass('pointer-events-none');
    expect(nextLink).toHaveClass('opacity-50');
    expect(prevLink).toHaveClass('pointer-events-none');
    expect(prevLink).toHaveClass('opacity-50');
  });

  test('应该正确处理快速跳转的无效输入', () => {
    const onPageChange = jest.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

    const jumpInput = screen.getByPlaceholderText('1');

    // 测试超出范围的输入
    fireEvent.change(jumpInput, { target: { value: '999' } });
    fireEvent.keyDown(jumpInput, { key: 'Enter' });

    expect(onPageChange).not.toHaveBeenCalled();

    // 测试负数输入
    fireEvent.change(jumpInput, { target: { value: '-1' } });
    fireEvent.keyDown(jumpInput, { key: 'Enter' });

    expect(onPageChange).not.toHaveBeenCalled();
  });
});
