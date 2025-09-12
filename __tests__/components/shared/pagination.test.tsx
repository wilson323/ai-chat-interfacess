/**
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
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test('应该支持每页数量变化', () => {
    const onPageSizeChange = jest.fn();
    render(<Pagination {...defaultProps} onPageSizeChange={onPageSizeChange} />);
    
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);
    
    const option20 = screen.getByText('20');
    fireEvent.click(option20);
    
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
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
    render(<Pagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />);
    
    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
    
    fireEvent.click(prevButton);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  test('应该支持禁用状态', () => {
    render(<Pagination {...defaultProps} disabled />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    const selectTrigger = screen.getByRole('combobox');
    const jumpInput = screen.getByPlaceholderText('1');
    
    expect(nextButton).toBeDisabled();
    expect(selectTrigger).toBeDisabled();
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
    
    expect(screen.queryByText('共 100 条记录，第 1-10 条')).not.toBeInTheDocument();
    expect(screen.queryByText('每页')).not.toBeInTheDocument();
    expect(screen.queryByText('跳至')).not.toBeInTheDocument();
  });

  test('应该支持自定义页面大小选项', () => {
    render(
      <Pagination
        {...defaultProps}
        pageSizeOptions={[5, 15, 25]}
      />
    );
    
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.queryByText('20')).not.toBeInTheDocument();
  });

  test('应该正确处理无数据情况', () => {
    render(<Pagination {...defaultProps} totalItems={0} />);
    
    expect(screen.queryByText('共 0 条记录')).not.toBeInTheDocument();
  });

  test('应该支持自定义样式', () => {
    const customClassName = 'custom-pagination';
    render(<Pagination {...defaultProps} className={customClassName} />);
    
    const pagination = screen.getByRole('navigation');
    expect(pagination).toHaveClass(customClassName);
  });

  test('应该正确处理单页情况', () => {
    render(<Pagination {...defaultProps} totalPages={1} currentPage={1} />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    const prevButton = screen.getByRole('button', { name: /previous/i });
    
    expect(nextButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
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
