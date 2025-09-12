/**
 * 模型配置API测试
 */

import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '@/app/api/admin/model-config/route'

// Mock数据
const mockModelConfig = {
  name: 'Test Model',
  type: 'openai',
  provider: 'OpenAI',
  version: 'gpt-4',
  status: 'active',
  capabilities: [
    { type: 'text', supported: true, maxTokens: 4000 }
  ],
  parameters: {
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: [],
    customParameters: {}
  },
  metadata: {
    description: 'Test model description',
    tags: ['test'],
    category: 'General',
    costPerToken: 0.00003,
    latency: 1000,
    accuracy: 0.95,
    version: '1.0.0'
  },
  isDefault: false
}

describe('模型配置API', () => {
  describe('GET /api/admin/model-config', () => {
    it('应该返回模型配置列表', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/model-config')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('models')
      expect(data.data).toHaveProperty('total')
      expect(data.data).toHaveProperty('page')
      expect(data.data).toHaveProperty('limit')
    })

    it('应该支持搜索参数', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/model-config?search=test&type=openai')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('应该支持分页参数', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/model-config?page=1&limit=5')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.limit).toBe(5)
    })
  })

  describe('POST /api/admin/model-config', () => {
    it('应该创建新的模型配置', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/model-config', {
        method: 'POST',
        body: JSON.stringify(mockModelConfig),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('id')
      expect(data.data.name).toBe(mockModelConfig.name)
    })

    it('应该验证必需字段', async () => {
      const invalidConfig = { ...mockModelConfig, name: '' }
      const request = new NextRequest('http://localhost:3000/api/admin/model-config', {
        method: 'POST',
        body: JSON.stringify(invalidConfig),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('数据验证失败')
    })

    it('应该处理无效的模型类型', async () => {
      const invalidConfig = { ...mockModelConfig, type: 'invalid' }
      const request = new NextRequest('http://localhost:3000/api/admin/model-config', {
        method: 'POST',
        body: JSON.stringify(invalidConfig),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('PUT /api/admin/model-config', () => {
    it('应该批量更新模型配置', async () => {
      const updates = [
        { id: '1', name: 'Updated Model 1' },
        { id: '2', name: 'Updated Model 2' }
      ]

      const request = new NextRequest('http://localhost:3000/api/admin/model-config', {
        method: 'PUT',
        body: JSON.stringify({ updates }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('应该处理无效的更新数据', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/model-config', {
        method: 'PUT',
        body: JSON.stringify({ updates: 'invalid' }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('DELETE /api/admin/model-config', () => {
    it('应该批量删除模型配置', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/model-config', {
        method: 'DELETE',
        body: JSON.stringify({ ids: ['1', '2', '3'] }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('应该处理无效的删除数据', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/model-config', {
        method: 'DELETE',
        body: JSON.stringify({ ids: 'invalid' }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })
})

