/**
 * AutoResizeTextarea 组件测试
 * 测试自动调整大小文本域的功能
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AutoResizeTextarea from '@/components/shared/auto-resize-textarea';

describe('AutoResizeTextarea 组件测试', () => {
  test('应该正确渲染文本域', () => {
    render(<AutoResizeTextarea placeholder='请输入内容' />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入内容')).toBeInTheDocument();
  });

  test('应该支持文本输入', () => {
    const handleChange = jest.fn();
    render(<AutoResizeTextarea onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    const testText = 'Hello, this is a test message';

    fireEvent.change(textarea, { target: { value: testText } });

    expect(textarea).toHaveValue(testText);
    expect(handleChange).toHaveBeenCalledWith(testText);
  });

  test('应该支持禁用状态', () => {
    render(<AutoResizeTextarea disabled />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  test('应该显示错误信息', () => {
    render(<AutoResizeTextarea error='这是一个错误' />);

    expect(screen.getByText('这是一个错误')).toBeInTheDocument();
  });

  test('应该支持自定义样式', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<AutoResizeTextarea style={customStyle} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveStyle('background-color: red');
  });

  test('应该支持自定义类名', () => {
    render(<AutoResizeTextarea className='custom-class' />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-class');
  });

  test('应该支持最小和最大行数', () => {
    render(<AutoResizeTextarea minRows={2} maxRows={5} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveStyle('min-height: 40px'); // 2 * 20px
    expect(textarea).toHaveStyle('max-height: 100px'); // 5 * 20px
  });

  test('应该支持ref转发', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<AutoResizeTextarea ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  test('应该正确处理长文本', () => {
    const handleChange = jest.fn();
    render(<AutoResizeTextarea onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    const longText =
      'This is a very long message that should trigger auto-resize functionality. '.repeat(
        10
      );

    fireEvent.change(textarea, { target: { value: longText } });

    expect(textarea).toHaveValue(longText);
    expect(handleChange).toHaveBeenCalledWith(longText);
  });

  test('应该正确处理空值', () => {
    const handleChange = jest.fn();
    render(<AutoResizeTextarea value='' onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('');

    fireEvent.change(textarea, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledWith('test');
  });
});
