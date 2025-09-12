/**
 * SearchInput 组件测试
 * 测试搜索输入组件的功能
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchInput from '@/components/shared/search-input';

// Mock 定时器
jest.useFakeTimers();

describe('SearchInput 组件测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  test('应该正确渲染搜索输入框', () => {
    render(<SearchInput placeholder="搜索内容" />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('搜索内容')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  test('应该支持文本输入', () => {
    const handleChange = jest.fn();
    render(<SearchInput onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    const testText = 'search query';
    
    fireEvent.change(input, { target: { value: testText } });
    
    expect(input).toHaveValue(testText);
    expect(handleChange).toHaveBeenCalledWith(testText);
  });

  test('应该支持防抖搜索', async () => {
    const handleSearch = jest.fn();
    render(<SearchInput onSearch={handleSearch} debounceMs={300} />);
    
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'test' } });
    
    // 验证防抖前没有调用
    expect(handleSearch).not.toHaveBeenCalled();
    
    // 快进时间
    jest.advanceTimersByTime(300);
    
    // 验证防抖后调用了
    await waitFor(() => {
      expect(handleSearch).toHaveBeenCalledWith('test');
    });
  });

  test('应该支持清除功能', () => {
    const handleClear = jest.fn();
    const handleChange = jest.fn();
    const handleSearch = jest.fn();
    
    render(
      <SearchInput
        value="test"
        onChange={handleChange}
        onClear={handleClear}
        onSearch={handleSearch}
        clearable
      />
    );
    
    const input = screen.getByRole('textbox');
    const clearButton = screen.getByRole('button', { name: /clear/i });
    
    expect(input).toHaveValue('test');
    expect(clearButton).toBeInTheDocument();
    
    fireEvent.click(clearButton);
    
    expect(handleClear).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith('');
    expect(handleSearch).toHaveBeenCalledWith('');
  });

  test('应该支持键盘事件', () => {
    const handleSearch = jest.fn();
    const handleClear = jest.fn();
    
    render(
      <SearchInput
        value="test"
        onSearch={handleSearch}
        onClear={handleClear}
      />
    );
    
    const input = screen.getByRole('textbox');
    
    // 测试Enter键搜索
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleSearch).toHaveBeenCalledWith('test');
    
    // 测试Escape键清除
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(handleClear).toHaveBeenCalled();
  });

  test('应该支持禁用状态', () => {
    render(<SearchInput disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  test('应该支持加载状态', () => {
    render(<SearchInput loading />);
    
    expect(screen.getByTestId('loading-icon')).toBeInTheDocument();
  });

  test('应该支持自定义占位符', () => {
    render(<SearchInput placeholder="自定义占位符" />);
    
    expect(screen.getByPlaceholderText('自定义占位符')).toBeInTheDocument();
  });

  test('应该支持外部值控制', () => {
    const { rerender } = render(<SearchInput value="initial" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('initial');
    
    rerender(<SearchInput value="updated" />);
    expect(input).toHaveValue('updated');
  });

  test('应该正确处理空值', () => {
    const handleSearch = jest.fn();
    render(<SearchInput onSearch={handleSearch} />);
    
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: '' } });
    jest.advanceTimersByTime(300);
    
    expect(handleSearch).toHaveBeenCalledWith('');
  });

  test('应该支持自定义防抖时间', () => {
    const handleSearch = jest.fn();
    render(<SearchInput onSearch={handleSearch} debounceMs={500} />);
    
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'test' } });
    
    // 300ms后不应该调用
    jest.advanceTimersByTime(300);
    expect(handleSearch).not.toHaveBeenCalled();
    
    // 500ms后应该调用
    jest.advanceTimersByTime(200);
    expect(handleSearch).toHaveBeenCalledWith('test');
  });
});
