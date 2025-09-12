/**
 * Card组件测试
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { renderWithProviders } from '@/lib/testing/test-utils'

describe('Card组件', () => {
  it('应该正确渲染Card', () => {
    renderWithProviders(<Card>测试卡片</Card>)
    
    const card = screen.getByText('测试卡片')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('rounded-lg border bg-card')
  })

  it('应该正确渲染CardHeader', () => {
    renderWithProviders(
      <Card>
        <CardHeader>卡片头部</CardHeader>
      </Card>
    )
    
    const header = screen.getByText('卡片头部')
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass('flex flex-col space-y-1.5 p-6')
  })

  it('应该正确渲染CardTitle', () => {
    renderWithProviders(
      <Card>
        <CardHeader>
          <CardTitle>卡片标题</CardTitle>
        </CardHeader>
      </Card>
    )
    
    const title = screen.getByText('卡片标题')
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('text-2xl font-semibold leading-none tracking-tight')
  })

  it('应该正确渲染CardDescription', () => {
    renderWithProviders(
      <Card>
        <CardHeader>
          <CardDescription>卡片描述</CardDescription>
        </CardHeader>
      </Card>
    )
    
    const description = screen.getByText('卡片描述')
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('text-sm text-muted-foreground')
  })

  it('应该正确渲染CardContent', () => {
    renderWithProviders(
      <Card>
        <CardContent>卡片内容</CardContent>
      </Card>
    )
    
    const content = screen.getByText('卡片内容')
    expect(content).toBeInTheDocument()
    expect(content).toHaveClass('p-6 pt-0')
  })

  it('应该正确渲染CardFooter', () => {
    renderWithProviders(
      <Card>
        <CardFooter>卡片底部</CardFooter>
      </Card>
    )
    
    const footer = screen.getByText('卡片底部')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('flex items-center p-6 pt-0')
  })

  it('应该支持完整的卡片结构', () => {
    renderWithProviders(
      <Card>
        <CardHeader>
          <CardTitle>完整卡片</CardTitle>
          <CardDescription>这是一个完整的卡片示例</CardDescription>
        </CardHeader>
        <CardContent>
          <p>这是卡片的主要内容</p>
        </CardContent>
        <CardFooter>
          <p>这是卡片底部</p>
        </CardFooter>
      </Card>
    )
    
    expect(screen.getByText('完整卡片')).toBeInTheDocument()
    expect(screen.getByText('这是一个完整的卡片示例')).toBeInTheDocument()
    expect(screen.getByText('这是卡片的主要内容')).toBeInTheDocument()
    expect(screen.getByText('这是卡片底部')).toBeInTheDocument()
  })

  it('应该支持自定义类名', () => {
    renderWithProviders(<Card className="custom-card">自定义卡片</Card>)
    
    const card = screen.getByText('自定义卡片')
    expect(card).toHaveClass('custom-card')
  })

  it('应该支持ref转发', () => {
    const ref = React.createRef<HTMLDivElement>()
    renderWithProviders(<Card ref={ref}>Ref卡片</Card>)
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

