import { NextResponse } from 'next/server'

// 生产级 mock 智能体列表，可后续对接数据库
const agents = [
  {
    id: 'fastgpt',
    name: 'FastGPT',
    type: 'fastgpt',
    published: true,
    welcomeText: '你好，我是 FastGPT 智能体！有什么可以帮您？',
  },
  {
    id: 'assistant',
    name: '通用助手',
    type: 'assistant',
    published: true,
    welcomeText: '您好，我是通用助手。',
  },
  {
    id: 'image-editor',
    name: '图像编辑器',
    type: 'image-editor',
    published: true,
    welcomeText: '欢迎使用图像编辑器。',
  },
  {
    id: 'cad-analyzer',
    name: 'CAD 分析器',
    type: 'cad-analyzer',
    published: false,
    welcomeText: 'CAD 分析器暂未开放。',
  },
]

export async function GET() {
  // 只返回已发布的智能体
  return NextResponse.json(agents.filter(a => a.published))
} 