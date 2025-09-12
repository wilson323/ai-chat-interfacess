/**
 * 功能完整性测试
 * 验证清理后的项目功能是否正常
 */

describe('项目功能完整性测试', () => {
  describe('核心功能验证', () => {
    it('应该能够导入核心模块', () => {
      // 测试工具函数导入
      expect(() => {
        require('@/lib/utils')
      }).not.toThrow()

      // 测试存储模块导入
      expect(() => {
        require('@/lib/storage')
      }).not.toThrow()

      // 测试API模块导入
      expect(() => {
        require('@/lib/api/fastgpt')
      }).not.toThrow()
    })

    it('应该能够导入UI组件', () => {
      // 测试基础UI组件
      expect(() => {
        require('@/components/ui/button')
      }).not.toThrow()

      expect(() => {
        require('@/components/ui/input')
      }).not.toThrow()

      expect(() => {
        require('@/components/ui/textarea')
      }).not.toThrow()
    })

    it('应该能够导入共享组件', () => {
      // 测试共享组件
      expect(() => {
        require('@/components/shared/auto-resize-textarea')
      }).not.toThrow()

      expect(() => {
        require('@/components/shared/search-input')
      }).not.toThrow()

      expect(() => {
        require('@/components/shared/pagination')
      }).not.toThrow()
    })
  })

  describe('依赖清理验证', () => {
    it('应该没有未使用的依赖导入错误', () => {
      // 验证清理的依赖不会导致导入错误
      const packageJson = require('../package.json')
      
      // 检查已移除的依赖不在package.json中
      expect(packageJson.dependencies).not.toHaveProperty('archiver')
      expect(packageJson.dependencies).not.toHaveProperty('exceljs')
      expect(packageJson.dependencies).not.toHaveProperty('pdfkit')
      expect(packageJson.dependencies).not.toHaveProperty('recharts')
      expect(packageJson.dependencies).not.toHaveProperty('embla-carousel-react')
      expect(packageJson.dependencies).not.toHaveProperty('pg-cloudflare')
    })

    it('应该保留必要的依赖', () => {
      const packageJson = require('../package.json')
      
      // 检查核心依赖存在
      expect(packageJson.dependencies).toHaveProperty('next')
      expect(packageJson.dependencies).toHaveProperty('react')
      expect(packageJson.dependencies).toHaveProperty('typescript')
      expect(packageJson.dependencies).toHaveProperty('zustand')
      expect(packageJson.dependencies).toHaveProperty('@tanstack/react-query')
    })
  })

  describe('类型安全验证', () => {
    it('应该能够正确解析TypeScript类型', () => {
      // 测试类型定义
      expect(() => {
        const { cn } = require('@/lib/utils')
        expect(typeof cn).toBe('function')
      }).not.toThrow()
    })
  })

  describe('环境配置验证', () => {
    it('应该能够读取环境变量', () => {
      // 测试环境变量配置
      expect(process.env.NODE_ENV).toBeDefined()
    })
  })
})
