#!/usr/bin/env tsx

/**
 * 项目规则检查脚本
 * 用于验证开发过程中是否严格遵守项目规则
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface RuleCheckResult {
  rule: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  details?: string
}

class RuleChecker {
  private results: RuleCheckResult[] = []
  private projectRoot: string

  constructor() {
    this.projectRoot = process.cwd()
  }

  /**
   * 检查自定义代码占比
   */
  checkCustomCodeRatio(): void {
    try {
      // 统计自定义组件代码行数
      const customComponentsPath = join(this.projectRoot, 'components')
      const customCodeLines = this.countLinesInDirectory(customComponentsPath, ['.tsx', '.ts'])
      
      // 统计项目总代码行数
      const totalCodeLines = this.countTotalCodeLines()
      
      const ratio = (customCodeLines / totalCodeLines) * 100
      
      if (ratio < 20) {
        this.addResult('自定义代码占比', 'PASS', `自定义代码占比: ${ratio.toFixed(2)}% (< 20%)`)
      } else {
        this.addResult('自定义代码占比', 'FAIL', `自定义代码占比: ${ratio.toFixed(2)}% (≥ 20%)`, 
          '建议优先使用成熟组件库，减少自定义代码')
      }
    } catch (error) {
      this.addResult('自定义代码占比', 'WARN', '无法检查自定义代码占比', error.message)
    }
  }

  /**
   * 检查TypeScript配置
   */
  checkTypeScriptConfig(): void {
    try {
      const tsconfigPath = join(this.projectRoot, 'tsconfig.json')
      if (!existsSync(tsconfigPath)) {
        this.addResult('TypeScript配置', 'FAIL', '缺少tsconfig.json文件')
        return
      }

      const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'))
      
      if (tsconfig.compilerOptions?.strict === true) {
        this.addResult('TypeScript配置', 'PASS', 'TypeScript严格模式已启用')
      } else {
        this.addResult('TypeScript配置', 'FAIL', 'TypeScript严格模式未启用')
      }
    } catch (error) {
      this.addResult('TypeScript配置', 'WARN', '无法检查TypeScript配置', error.message)
    }
  }

  /**
   * 检查组件库使用规范
   */
  checkComponentLibraryUsage(): void {
    try {
      const componentsPath = join(this.projectRoot, 'components')
      const files = this.getAllFiles(componentsPath, ['.tsx', '.ts'])
      
      let shadcnUsage = 0
      let antdUsage = 0
      let customComponents = 0
      
      files.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        
        // 检查shadcn/ui使用
        if (content.includes('@/components/ui/')) {
          shadcnUsage++
        }
        
        // 检查Ant Design使用
        if (content.includes('from \'antd\'')) {
          antdUsage++
        }
        
        // 检查自定义组件
        if (content.includes('export function') && !content.includes('@/components/ui/')) {
          customComponents++
        }
      })
      
      if (shadcnUsage > 0) {
        this.addResult('组件库使用', 'PASS', `shadcn/ui使用: ${shadcnUsage}个文件`)
      }
      
      if (customComponents > 0) {
        this.addResult('组件库使用', 'WARN', `自定义组件: ${customComponents}个`, 
          '建议优先使用成熟组件库')
      }
    } catch (error) {
      this.addResult('组件库使用', 'WARN', '无法检查组件库使用情况', error.message)
    }
  }

  /**
   * 检查测试覆盖率
   */
  checkTestCoverage(): void {
    try {
      // 检查是否有测试文件
      const testFiles = this.getAllFiles(join(this.projectRoot, '__tests__'), ['.test.ts', '.test.tsx'])
      const componentFiles = this.getAllFiles(join(this.projectRoot, 'components'), ['.tsx'])
      
      const testRatio = (testFiles.length / componentFiles.length) * 100
      
      if (testRatio >= 80) {
        this.addResult('测试覆盖率', 'PASS', `测试文件覆盖率: ${testRatio.toFixed(2)}% (≥ 80%)`)
      } else {
        this.addResult('测试覆盖率', 'FAIL', `测试文件覆盖率: ${testRatio.toFixed(2)}% (< 80%)`, 
          '建议增加测试文件，确保测试覆盖率 ≥ 80%')
      }
    } catch (error) {
      this.addResult('测试覆盖率', 'WARN', '无法检查测试覆盖率', error.message)
    }
  }

  /**
   * 检查环境配置
   */
  checkEnvironmentConfig(): void {
    try {
      const envPath = join(this.projectRoot, '.env')
      const envExamplePath = join(this.projectRoot, '.env.example')
      
      if (existsSync(envExamplePath)) {
        this.addResult('环境配置', 'PASS', '存在.env.example文件')
      } else {
        this.addResult('环境配置', 'WARN', '缺少.env.example文件')
      }
      
      if (existsSync(envPath)) {
        this.addResult('环境配置', 'PASS', '存在.env文件')
      } else {
        this.addResult('环境配置', 'WARN', '缺少.env文件')
      }
    } catch (error) {
      this.addResult('环境配置', 'WARN', '无法检查环境配置', error.message)
    }
  }

  /**
   * 检查代码质量工具
   */
  checkCodeQualityTools(): void {
    try {
      const packageJsonPath = join(this.projectRoot, 'package.json')
      if (!existsSync(packageJsonPath)) {
        this.addResult('代码质量工具', 'FAIL', '缺少package.json文件')
        return
      }

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      const devDependencies = packageJson.devDependencies || {}
      
      const requiredTools = ['eslint', 'prettier', 'typescript', 'jest']
      const missingTools = requiredTools.filter(tool => !devDependencies[tool])
      
      if (missingTools.length === 0) {
        this.addResult('代码质量工具', 'PASS', '所有必需的代码质量工具已安装')
      } else {
        this.addResult('代码质量工具', 'FAIL', `缺少代码质量工具: ${missingTools.join(', ')}`)
      }
    } catch (error) {
      this.addResult('代码质量工具', 'WARN', '无法检查代码质量工具', error.message)
    }
  }

  /**
   * 检查项目规则文档
   */
  checkProjectRules(): void {
    try {
      const rulesPath = join(this.projectRoot, 'PROJECT_RULES.md')
      
      if (existsSync(rulesPath)) {
        this.addResult('项目规则文档', 'PASS', 'PROJECT_RULES.md文件存在')
      } else {
        this.addResult('项目规则文档', 'FAIL', '缺少PROJECT_RULES.md文件')
      }
    } catch (error) {
      this.addResult('项目规则文档', 'WARN', '无法检查项目规则文档', error.message)
    }
  }

  /**
   * 运行所有检查
   */
  runAllChecks(): void {
    console.log('🔍 开始检查项目规则...\n')
    
    this.checkProjectRules()
    this.checkTypeScriptConfig()
    this.checkComponentLibraryUsage()
    this.checkCustomCodeRatio()
    this.checkTestCoverage()
    this.checkEnvironmentConfig()
    this.checkCodeQualityTools()
    
    this.printResults()
  }

  /**
   * 打印检查结果
   */
  private printResults(): void {
    console.log('\n📊 检查结果汇总:\n')
    
    const passCount = this.results.filter(r => r.status === 'PASS').length
    const failCount = this.results.filter(r => r.status === 'FAIL').length
    const warnCount = this.results.filter(r => r.status === 'WARN').length
    
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
      console.log(`${icon} ${result.rule}: ${result.message}`)
      
      if (result.details) {
        console.log(`   📝 ${result.details}`)
      }
    })
    
    console.log(`\n📈 统计: ✅ ${passCount} 通过 | ❌ ${failCount} 失败 | ⚠️ ${warnCount} 警告`)
    
    if (failCount > 0) {
      console.log('\n🚨 存在失败的检查项，请修复后重新检查')
      process.exit(1)
    } else {
      console.log('\n🎉 所有规则检查通过！')
    }
  }

  /**
   * 添加检查结果
   */
  private addResult(rule: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: string): void {
    this.results.push({ rule, status, message, details })
  }

  /**
   * 统计目录中的代码行数
   */
  private countLinesInDirectory(dirPath: string, extensions: string[]): number {
    let totalLines = 0
    
    try {
      const files = this.getAllFiles(dirPath, extensions)
      files.forEach(file => {
        try {
          const content = readFileSync(file, 'utf-8')
          totalLines += content.split('\n').length
        } catch (error) {
          // 忽略无法读取的文件
        }
      })
    } catch (error) {
      // 忽略无法访问的目录
    }
    
    return totalLines
  }

  /**
   * 统计项目总代码行数
   */
  private countTotalCodeLines(): number {
    const extensions = ['.ts', '.tsx', '.js', '.jsx']
    let totalLines = 0
    
    // 统计主要目录的代码行数
    const mainDirs = ['components', 'app', 'lib', 'hooks', 'types']
    
    mainDirs.forEach(dir => {
      const dirPath = join(this.projectRoot, dir)
      totalLines += this.countLinesInDirectory(dirPath, extensions)
    })
    
    return totalLines
  }

  /**
   * 获取目录中的所有文件
   */
  private getAllFiles(dirPath: string, extensions: string[]): string[] {
    const files: string[] = []
    
    try {
      const { readdirSync, statSync } = require('fs')
      
      const items = readdirSync(dirPath)
      
      items.forEach((item: string) => {
        const fullPath = join(dirPath, item)
        const stat = statSync(fullPath)
        
        if (stat.isDirectory()) {
          files.push(...this.getAllFiles(fullPath, extensions))
        } else if (stat.isFile()) {
          const ext = item.substring(item.lastIndexOf('.'))
          if (extensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      })
    } catch (error) {
      // 忽略无法访问的目录
    }
    
    return files
  }
}

// 运行检查
if (require.main === module) {
  const checker = new RuleChecker()
  checker.runAllChecks()
}

export { RuleChecker }
