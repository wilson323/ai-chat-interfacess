/**
 * 自定义代码占比检查脚本
 * 监控项目中自定义代码占比，确保 < 20%
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface CodeAnalysisResult {
  totalLines: number
  customLines: number
  libraryLines: number
  customRatio: number
  files: {
    path: string
    lines: number
    type: 'custom' | 'library' | 'config'
  }[]
}

class CustomCodeRatioChecker {
  private result: CodeAnalysisResult = {
    totalLines: 0,
    customLines: 0,
    libraryLines: 0,
    customRatio: 0,
    files: []
  }

  // 成熟组件库路径模式
  private libraryPatterns = [
    /node_modules/,
    /components\/ui\//, // shadcn/ui
    /@radix-ui/,
    /antd/,
    /lucide-react/,
    /framer-motion/,
    /react-hook-form/,
    /zod/,
    /zustand/,
    /@tanstack/,
    /date-fns/,
    /clsx/,
    /tailwind-merge/
  ]

  // 配置文件模式
  private configPatterns = [
    /\.config\./,
    /\.json$/,
    /\.md$/,
    /\.mdc$/,
    /\.env/,
    /package\.json$/,
    /tsconfig\.json$/,
    /tailwind\.config/,
    /next\.config/,
    /eslint\.config/,
    /prettier\.config/
  ]

  async check(): Promise<void> {
    console.log('🔍 开始检查自定义代码占比...')
    
    // 扫描项目文件
    await this.scanProject()
    
    // 计算占比
    this.calculateRatio()
    
    // 生成报告
    this.generateReport()
  }

  private async scanProject(): Promise<void> {
    const projectRoot = process.cwd()
    const srcDir = path.join(projectRoot, 'src')
    const componentsDir = path.join(projectRoot, 'components')
    const appDir = path.join(projectRoot, 'app')
    const libDir = path.join(projectRoot, 'lib')
    const typesDir = path.join(projectRoot, 'types')
    const hooksDir = path.join(projectRoot, 'hooks')

    const directories = [srcDir, componentsDir, appDir, libDir, typesDir, hooksDir]
    
    for (const dir of directories) {
      if (fs.existsSync(dir)) {
        await this.scanDirectory(dir)
      }
    }
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    const files = this.getFilesRecursively(dirPath)
    
    for (const file of files) {
      if (this.isCodeFile(file)) {
        const lines = this.countLines(file)
        const type = this.classifyFile(file)
        
        this.result.files.push({
          path: file,
          lines,
          type
        })
        
        this.result.totalLines += lines
        
        if (type === 'custom') {
          this.result.customLines += lines
        } else if (type === 'library') {
          this.result.libraryLines += lines
        }
      }
    }
  }

  private getFilesRecursively(dirPath: string): string[] {
    const files: string[] = []
    
    try {
      const items = fs.readdirSync(dirPath)
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          // 跳过node_modules和.git目录
          if (item === 'node_modules' || item === '.git' || item === '.next') {
            continue
          }
          files.push(...this.getFilesRecursively(fullPath))
        } else if (stat.isFile()) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      console.warn(`无法读取目录 ${dirPath}:`, error)
    }
    
    return files
  }

  private isCodeFile(filePath: string): boolean {
    const ext = path.extname(filePath)
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext)
  }

  private countLines(filePath: string): number {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      return content.split('\n').length
    } catch (error) {
      console.warn(`无法读取文件 ${filePath}:`, error)
      return 0
    }
  }

  private classifyFile(filePath: string): 'custom' | 'library' | 'config' {
    // 检查是否为配置文件
    if (this.configPatterns.some(pattern => pattern.test(filePath))) {
      return 'config'
    }
    
    // 检查是否为库文件
    if (this.libraryPatterns.some(pattern => pattern.test(filePath))) {
      return 'library'
    }
    
    // 检查是否为共享组件（基于成熟库的包装组件）
    if (filePath.includes('components/shared/')) {
      return 'library'
    }
    
    // 检查是否为UI组件（shadcn/ui）
    if (filePath.includes('components/ui/')) {
      return 'library'
    }
    
    // 其他都视为自定义代码
    return 'custom'
  }

  private calculateRatio(): void {
    this.result.customRatio = this.result.totalLines > 0 
      ? (this.result.customLines / this.result.totalLines) * 100 
      : 0
  }

  private generateReport(): void {
    console.log('\n📊 自定义代码占比分析报告')
    console.log('=' .repeat(50))
    
    console.log(`总代码行数: ${this.result.totalLines.toLocaleString()}`)
    console.log(`自定义代码行数: ${this.result.customLines.toLocaleString()}`)
    console.log(`库代码行数: ${this.result.libraryLines.toLocaleString()}`)
    console.log(`自定义代码占比: ${this.result.customRatio.toFixed(2)}%`)
    
    // 检查是否超过阈值
    const threshold = 20
    if (this.result.customRatio > threshold) {
      console.log(`\n❌ 警告: 自定义代码占比超过阈值 (${threshold}%)`)
      console.log('建议: 优先使用成熟组件库，减少自定义代码')
    } else {
      console.log(`\n✅ 通过: 自定义代码占比在阈值内 (${threshold}%)`)
    }
    
    // 显示文件分类统计
    console.log('\n📁 文件分类统计:')
    const customFiles = this.result.files.filter(f => f.type === 'custom')
    const libraryFiles = this.result.files.filter(f => f.type === 'library')
    const configFiles = this.result.files.filter(f => f.type === 'config')
    
    console.log(`自定义文件: ${customFiles.length} 个`)
    console.log(`库文件: ${libraryFiles.length} 个`)
    console.log(`配置文件: ${configFiles.length} 个`)
    
    // 显示最大的自定义文件
    if (customFiles.length > 0) {
      console.log('\n🔍 最大的自定义文件 (前10个):')
      customFiles
        .sort((a, b) => b.lines - a.lines)
        .slice(0, 10)
        .forEach((file, index) => {
          console.log(`${index + 1}. ${file.path} (${file.lines} 行)`)
        })
    }
    
    // 生成建议
    this.generateSuggestions()
  }

  private generateSuggestions(): void {
    console.log('\n💡 优化建议:')
    
    if (this.result.customRatio > 20) {
      console.log('1. 优先使用 shadcn/ui 组件替代自定义UI组件')
      console.log('2. 使用 Ant Design 处理复杂业务组件')
      console.log('3. 使用 Radix UI 处理无障碍组件')
      console.log('4. 将自定义组件重构为基于成熟库的包装组件')
    }
    
    console.log('5. 定期检查并清理未使用的代码')
    console.log('6. 使用组合模式而非继承模式')
    console.log('7. 提取可复用的业务逻辑为工具函数')
  }
}

// 运行检查
async function main() {
  try {
    const checker = new CustomCodeRatioChecker()
    await checker.check()
  } catch (error) {
    console.error('检查失败:', error)
    process.exit(1)
  }
}

main()

