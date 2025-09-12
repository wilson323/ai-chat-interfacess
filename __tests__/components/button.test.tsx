/**
 * Button组件测试
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { renderWithProviders } from '@/lib/testing/test-utils'

describe('Button组件', () => {
  it('应该正确渲染', () => {
    renderWithProviders(<Button>测试按钮</Button>)
    
    const button = screen.getByRole('button', { name: '测试按钮' })
    expect(button).toBeInTheDocument()
  })

  it('应该支持不同的变体', () => {
    const { rerender } = renderWithProviders(<Button variant="default">默认按钮</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')

    rerender(<Button variant="destructive">危险按钮</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')

    rerender(<Button variant="outline">轮廓按钮</Button>)
    expect(screen.getByRole('button')).toHaveClass('border')

    rerender(<Button variant="ghost">幽灵按钮</Button>)
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')
  })

  it('应该支持不同的尺寸', () => {
    const { rerender } = renderWithProviders(<Button size="default">默认尺寸</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10')

    rerender(<Button size="sm">小尺寸</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-9')

    rerender(<Button size="lg">大尺寸</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-11')

    rerender(<Button size="icon">图标尺寸</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10 w-10')
  })

  it('应该支持禁用状态', () => {
    renderWithProviders(<Button disabled>禁用按钮</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none')
  })

  it('应该支持加载状态', () => {
    renderWithProviders(<Button disabled>加载中...</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('应该响应点击事件', () => {
    const handleClick = jest.fn()
    renderWithProviders(<Button onClick={handleClick}>可点击按钮</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('应该支持自定义类名', () => {
    renderWithProviders(<Button className="custom-class">自定义按钮</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('应该支持ref转发', () => {
    const ref = React.createRef<HTMLButtonElement>()
    renderWithProviders(<Button ref={ref}>Ref按钮</Button>)
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('应该支持asChild属性', () => {
    renderWithProviders(
      <Button asChild>
        <a href="/test">链接按钮</a>
      </Button>
    )
    
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })
})