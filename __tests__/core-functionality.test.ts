/**
 * 核心功能测试
 * 验证项目的基本功能是否正常工作
 */

describe('核心功能测试', () => {
  describe('项目基础验证', () => {
    it('应该能够导入主要模块', () => {
      // 测试主要组件是否能正常导入
      expect(() => {
        require('@/components/chat-message');
        require('@/components/chat-input');
        require('@/components/header');
        require('@/components/sidebar');
      }).not.toThrow();
    });

    it('应该能够导入API路由', () => {
      // 测试主要API路由是否能正常导入
      expect(() => {
        require('@/app/api/health/route');
        require('@/app/api/chat-proxy/route');
        require('@/app/api/agent-config/route');
      }).not.toThrow();
    });

    it('应该能够导入工具库', () => {
      // 测试工具库是否能正常导入
      expect(() => {
        require('@/lib/utils');
        require('@/lib/api');
      }).not.toThrow();
    });
  });

  describe('配置验证', () => {
    it('应该有有效的package.json配置', () => {
      const packageJson = require('../package.json');

      expect(packageJson.name).toBeDefined();
      expect(packageJson.version).toBeDefined();
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
    });

    it('应该有有效的TypeScript配置', () => {
      const tsconfig = require('../tsconfig.json');

      expect(tsconfig.compilerOptions).toBeDefined();
      expect(tsconfig.compilerOptions.strict).toBe(true);
      expect(tsconfig.compilerOptions.target).toBeDefined();
    });

    it('应该有有效的Next.js配置', () => {
      const nextConfig = require('../next.config.mjs');

      expect(nextConfig).toBeDefined();
    });
  });

  describe('环境变量验证', () => {
    it('应该有基本的Node.js环境', () => {
      expect(process.version).toBeDefined();
      expect(process.platform).toBeDefined();
    });

    it('应该有必要的环境变量', () => {
      // 检查是否有基本的Next.js环境变量
      expect(process.env.NODE_ENV).toBeDefined();
    });
  });

  describe('文件结构验证', () => {
    const fs = require('fs');
    const path = require('path');

    it('应该有必要的目录结构', () => {
      const requiredDirs = ['app', 'components', 'lib', '__tests__', 'docs'];

      requiredDirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });

    it('应该有必要的配置文件', () => {
      const requiredFiles = [
        'package.json',
        'tsconfig.json',
        'next.config.mjs',
        'tailwind.config.ts',
        'jest.config.js',
      ];

      requiredFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('依赖验证', () => {
    it('应该能够解析React相关依赖', () => {
      expect(() => {
        require('react');
        require('react-dom');
      }).not.toThrow();
    });

    it('应该能够解析Next.js相关依赖', () => {
      expect(() => {
        require('next/server');
        require('next/navigation');
      }).not.toThrow();
    });

    it('应该能够解析UI组件库', () => {
      expect(() => {
        require('@radix-ui/react-dialog');
        require('@radix-ui/react-button');
      }).not.toThrow();
    });
  });

  describe('工具函数验证', () => {
    it('应该能够使用基本的工具函数', () => {
      const { cn } = require('@/lib/utils');

      // 测试cn函数是否能正常工作
      expect(typeof cn).toBe('function');
      expect(cn('class1', 'class2')).toBeDefined();
    });
  });

  describe('错误处理验证', () => {
    it('应该能够处理模块导入错误', () => {
      expect(() => {
        try {
          require('@/non-existent-module');
        } catch (error) {
          // 预期会抛出错误
          expect(error).toBeDefined();
        }
      }).not.toThrow();
    });
  });
});
