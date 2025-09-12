import { 
  getCustomAgentStorageStats, 
  clearAllCustomAgentData, 
  exportAllCustomAgentData, 
  importCustomAgentData,
  CustomAgentData 
} from '@/lib/storage/features/management/custom-agent-management'
import { CadHistory } from '@/lib/db/models/cad-history'
import { AgentConfig } from '@/lib/db/models/agent-config'
import fs from 'fs'
import path from 'path'

// Mock 数据库模型
jest.mock('@/lib/db/models/cad-history')
jest.mock('@/lib/db/models/agent-config')
jest.mock('fs')

const mockCadHistory = CadHistory as jest.Mocked<typeof CadHistory>
const mockAgentConfig = AgentConfig as jest.Mocked<typeof AgentConfig>
const mockFs = fs as jest.Mocked<typeof fs>

describe('Custom Agent Management', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCustomAgentStorageStats', () => {
    it('应该正确计算存储统计信息', async () => {
      // Mock 数据库数据
      const mockCustomAgents = [
        {
          id: 1,
          name: 'CAD分析器',
          type: 'cad-analyzer',
          toJSON: () => ({ id: 1, name: 'CAD分析器', type: 'cad-analyzer' })
        }
      ]

      const mockCadHistories = [
        {
          analysisResult: '测试分析结果',
          fileName: 'test.dwg',
          fileUrl: '/cad-analyzer/test.dwg'
        }
      ]

      mockAgentConfig.findAll.mockResolvedValue(mockCustomAgents as any)
      mockCadHistory.findAll.mockResolvedValue(mockCadHistories as any)

      // Mock 文件系统
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue([
        { name: 'test1.dwg', isFile: () => true },
        { name: 'test2.png', isFile: () => true }
      ] as any)
      mockFs.statSync.mockReturnValue({ size: 1024 } as any)

      const result = await getCustomAgentStorageStats()

      expect(result).toEqual({
        totalSizeMB: expect.any(Number),
        maxSizeMB: 1000,
        usagePercent: expect.any(Number),
        chatCount: 1
      })
      expect(result.totalSizeMB).toBeGreaterThan(0)
      expect(result.usagePercent).toBeGreaterThan(0)
    })

    it('应该处理数据库错误', async () => {
      mockAgentConfig.findAll.mockRejectedValue(new Error('数据库连接失败'))

      const result = await getCustomAgentStorageStats()

      expect(result).toEqual({
        totalSizeMB: 0,
        maxSizeMB: 1000,
        usagePercent: 0,
        chatCount: 0
      })
    })
  })

  describe('clearAllCustomAgentData', () => {
    it('应该清除所有自研智能体数据', async () => {
      mockCadHistory.destroy.mockResolvedValue(1)
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['test1.dwg', 'test2.png'] as any)
      mockFs.unlinkSync.mockImplementation(() => {})

      const result = await clearAllCustomAgentData()

      expect(result).toBe(true)
      expect(mockCadHistory.destroy).toHaveBeenCalledWith({ where: {} })
    })

    it('应该处理清除错误', async () => {
      mockCadHistory.destroy.mockRejectedValue(new Error('清除失败'))

      const result = await clearAllCustomAgentData()

      expect(result).toBe(false)
    })
  })

  describe('exportAllCustomAgentData', () => {
    it('应该导出所有自研智能体数据', async () => {
      const mockCustomAgents = [
        {
          id: 1,
          name: 'CAD分析器',
          type: 'cad-analyzer',
          apiKey: 'test-key',
          appId: 'test-app',
          systemPrompt: '测试提示',
          temperature: 0.7,
          maxTokens: 2000,
          isPublished: true,
          description: '测试描述',
          order: 1,
          supportsStream: true,
          supportsDetail: true,
          globalVariables: '{}',
          welcomeText: '欢迎',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02')
        }
      ]

      const mockHistories = [
        {
          fileName: 'test.dwg',
          fileUrl: '/cad-analyzer/test.dwg',
          analysisResult: '测试分析结果'
        }
      ]

      mockAgentConfig.findAll.mockResolvedValue(mockCustomAgents as any)
      mockCadHistory.findAll.mockResolvedValue(mockHistories as any)

      const result = await exportAllCustomAgentData()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: '1',
        name: 'CAD分析器',
        type: 'cad-analyzer',
        config: expect.objectContaining({
          apiKey: 'test-key',
          appId: 'test-app'
        }),
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        fileData: expect.arrayContaining([
          expect.objectContaining({
            fileName: 'test.dwg',
            fileUrl: '/cad-analyzer/test.dwg'
          })
        ])
      })
    })

    it('应该处理导出错误', async () => {
      mockAgentConfig.findAll.mockRejectedValue(new Error('导出失败'))

      const result = await exportAllCustomAgentData()

      expect(result).toEqual([])
    })
  })

  describe('importCustomAgentData', () => {
    it('应该导入自研智能体数据', async () => {
      const mockData: CustomAgentData[] = [
        {
          id: '1',
          name: '新CAD分析器',
          type: 'cad-analyzer',
          config: {
            apiKey: 'new-key',
            appId: 'new-app',
            systemPrompt: '新提示',
            temperature: 0.8,
            maxTokens: 3000,
            isPublished: true,
            description: '新描述',
            order: 2,
            supportsStream: true,
            supportsDetail: true,
            globalVariables: '{}',
            welcomeText: '新欢迎'
          },
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02'),
          fileData: [
            {
              fileName: 'new.dwg',
              fileUrl: '/cad-analyzer/new.dwg',
              fileSize: 1024,
              analysisResult: '新分析结果'
            }
          ]
        }
      ]

      mockAgentConfig.findOne.mockResolvedValue(null) // 不存在同名智能体
      mockAgentConfig.create.mockResolvedValue({ id: 2 } as any)
      mockCadHistory.create.mockResolvedValue({} as any)

      const result = await importCustomAgentData(mockData)

      expect(result).toBe(true)
      expect(mockAgentConfig.create).toHaveBeenCalled()
      expect(mockCadHistory.create).toHaveBeenCalled()
    })

    it('应该跳过已存在的智能体', async () => {
      const mockData: CustomAgentData[] = [
        {
          id: '1',
          name: '已存在智能体',
          type: 'cad-analyzer',
          config: {},
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockAgentConfig.findOne.mockResolvedValue({ id: 1 } as any) // 已存在

      const result = await importCustomAgentData(mockData)

      expect(result).toBe(true)
      expect(mockAgentConfig.create).not.toHaveBeenCalled()
    })

    it('应该处理导入错误', async () => {
      const mockData: CustomAgentData[] = []
      mockAgentConfig.findOne.mockRejectedValue(new Error('导入失败'))

      const result = await importCustomAgentData(mockData)

      expect(result).toBe(false)
    })
  })
})

