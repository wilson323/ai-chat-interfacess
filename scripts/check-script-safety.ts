#!/usr/bin/env tsx

/**
 * 脚本安全检查工具
 * 检查项目中所有脚本是否符合安全规范，禁止修改代码
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

interface ScriptSafetyReport {
  totalScripts: number
  safeScripts: number
  unsafeScripts: number
  violations: Array<{
    script: string
    violations: string[]
    severity: 'high' | 'medium' | 'low'
  }>
  recommendations: string[]
}

interface Violation {
  type: 'write' | 'delete' | 'modify' | 'execute' | 'create'
  operation: string
  line: number
  description: string
}

class ScriptSafetyChecker {
  private report: ScriptSafetyReport = {
    totalScripts: 0,
    safeScripts: 0,
    unsafeScripts: 0,
    violations: [],
    recommendations: []
  }

  private readonly forbiddenOperations = {
    write: [
      'writeFileSync',
      'writeFile',
      'writeFileAsync',
      'createWriteStream',
      'fs.writeFile',
      'fs.writeFileSync'
    ],
    delete: [
      'unlinkSync',
      'unlink',
      'unlinkAsync',
      'rmdirSync',
      'rmdir',
      'rmdirAsync',
      'rmSync',
      'rm',
      'rmAsync',
      'fs.unlink',
      'fs.unlinkSync',
      'fs.rmdir',
      'fs.rmdirSync'
    ],
    modify: [
      'appendFileSync',
      'appendFile',
      'appendFileAsync',
      'chmodSync',
      'chmod',
      'chmodAsync',
      'chownSync',
      'chown',
      'chownAsync',
      'fs.appendFile',
      'fs.appendFileSync',
      'fs.chmod',
      'fs.chmodSync'
    ],
    create: [
      'mkdirSync',
      'mkdir',
      'mkdirAsync',
      'fs.mkdir',
      'fs.mkdirSync'
    ],
    execute: [
      'execSync',
      'exec',
      'execAsync',
      'spawn',
      'spawnSync',
      'child_process.exec',
      'child_process.execSync',
      'child_process.spawn'
    ]
  }

  private readonly allowedOperations = [
    'readFileSync',
    'readFile',
    'readFileAsync',
    'readdirSync',
    'readdir',
    'readdirAsync',
    'statSync',
    'stat',
    'statAsync',
    'existsSync',
    'exists',
    'existsAsync',
    'accessSync',
    'access',
    'accessAsync',
    'fs.readFile',
    'fs.readFileSync',
    'fs.readdir',
    'fs.readdirSync',
    'fs.stat',
    'fs.statSync',
    'fs.existsSync',
    'fs.access',
    'fs.accessSync'
  ]

  private readonly excludePatterns = [
    /node_modules/,
    /\.next/,
    /dist/,
    /build/,
    /coverage/,
    /\.git/,
    /playwright-report/,
    /test-results/,
  ]

  /**
   * 检查文件是否应该被排除
   */
  private shouldExcludeFile(filePath: string): boolean {
    return this.excludePatterns.some(pattern => pattern.test(filePath))
  }

  /**
   * 检查文件是否为脚本文件
   */
  private isScriptFile(filePath: string): boolean {
    const ext = extname(filePath)
    return ext === '.ts' || ext === '.js' || ext === '.mjs'
  }

  /**
   * 扫描目录中的脚本文件
   */
  private scanDirectory(dirPath: string): string[] {
    const files: string[] = []
    
    try {
      const items = readdirSync(dirPath)
      
      for (const item of items) {
        const fullPath = join(dirPath, item)
        const stat = statSync(fullPath)
        
        if (stat.isDirectory()) {
          if (!this.shouldExcludeFile(fullPath)) {
            files.push(...this.scanDirectory(fullPath))
          }
        } else if (stat.isFile() && this.isScriptFile(fullPath)) {
          if (!this.shouldExcludeFile(fullPath)) {
            files.push(fullPath)
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Cannot read directory ${dirPath}:`, error)
    }
    
    return files
  }

  /**
   * 检查脚本文件中的违规操作
   */
  private checkScriptForViolations(scriptPath: string): Violation[] {
    const violations: Violation[] = []
    
    try {
      const content = readFileSync(scriptPath, 'utf-8')
      const lines = content.split('\n')
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNumber = i + 1
        
        // 检查各种违规操作
        for (const [type, operations] of Object.entries(this.forbiddenOperations)) {
          for (const operation of operations) {
            if (line.includes(operation)) {
              // 检查是否在注释中
              const commentIndex = line.indexOf('//')
              const operationIndex = line.indexOf(operation)
              
              if (commentIndex === -1 || operationIndex < commentIndex) {
                violations.push({
                  type: type as any,
                  operation,
                  line: lineNumber,
                  description: this.getViolationDescription(type, operation)
                })
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Cannot read script ${scriptPath}:`, error)
    }
    
    return violations
  }

  /**
   * 获取违规描述
   */
  private getViolationDescription(type: string, operation: string): string {
    const descriptions = {
      write: `检测到文件写入操作: ${operation}`,
      delete: `检测到文件删除操作: ${operation}`,
      modify: `检测到文件修改操作: ${operation}`,
      create: `检测到文件创建操作: ${operation}`,
      execute: `检测到系统命令执行操作: ${operation}`
    }
    
    return descriptions[type as keyof typeof descriptions] || `检测到违规操作: ${operation}`
  }

  /**
   * 计算违规严重程度
   */
  private calculateSeverity(violations: Violation[]): 'high' | 'medium' | 'low' {
    const highSeverityTypes = ['write', 'delete', 'execute']
    const mediumSeverityTypes = ['modify', 'create']
    
    const hasHighSeverity = violations.some(v => highSeverityTypes.includes(v.type))
    const hasMediumSeverity = violations.some(v => mediumSeverityTypes.includes(v.type))
    
    if (hasHighSeverity) return 'high'
    if (hasMediumSeverity) return 'medium'
    return 'low'
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(): void {
    if (this.report.unsafeScripts > 0) {
      this.report.recommendations.push(
        `发现 ${this.report.unsafeScripts} 个脚本存在违规操作，需要立即修复`
      )
    }
    
    const highSeverityViolations = this.report.violations.filter(v => v.severity === 'high')
    if (highSeverityViolations.length > 0) {
      this.report.recommendations.push(
        `发现 ${highSeverityViolations.length} 个高危违规操作，需要立即处理`
      )
    }
    
    if (this.report.safeScripts === this.report.totalScripts) {
      this.report.recommendations.push('✅ 所有脚本都符合安全规范')
    }
  }

  /**
   * 运行脚本安全检查
   */
  public async runCheck(): Promise<ScriptSafetyReport> {
    console.log('🔍 开始脚本安全检查...')
    
    // 扫描所有脚本文件
    const scripts = this.scanDirectory('scripts')
    console.log(`📁 扫描到 ${scripts.length} 个脚本文件`)
    
    // 检查每个脚本
    for (const script of scripts) {
      this.report.totalScripts++
      
      const violations = this.checkScriptForViolations(script)
      
      if (violations.length === 0) {
        this.report.safeScripts++
      } else {
        this.report.unsafeScripts++
        this.report.violations.push({
          script,
          violations: violations.map(v => v.description),
          severity: this.calculateSeverity(violations)
        })
      }
    }
    
    // 生成建议
    this.generateRecommendations()
    
    return this.report
  }

  /**
   * 打印检查报告
   */
  public printReport(): void {
    console.log('\n📊 脚本安全检查报告')
    console.log('=' .repeat(50))
    
    console.log(`📁 总脚本数: ${this.report.totalScripts}`)
    console.log(`✅ 安全脚本数: ${this.report.safeScripts}`)
    console.log(`❌ 不安全脚本数: ${this.report.unsafeScripts}`)
    
    if (this.report.violations.length > 0) {
      console.log('\n🚫 违规脚本详情:')
      this.report.violations.forEach((violation, index) => {
        const severityIcon = violation.severity === 'high' ? '🔴' : 
                           violation.severity === 'medium' ? '🟡' : '🟢'
        
        console.log(`${index + 1}. ${severityIcon} ${violation.script}`)
        violation.violations.forEach(v => {
          console.log(`   - ${v}`)
        })
      })
    }
    
    if (this.report.recommendations.length > 0) {
      console.log('\n💡 改进建议:')
      this.report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`)
      })
    }
    
    // 计算安全分数
    const safetyScore = this.calculateSafetyScore()
    console.log(`\n🎯 脚本安全分数: ${safetyScore}/100`)
    
    if (safetyScore >= 90) {
      console.log('✅ 脚本安全状况良好')
    } else if (safetyScore >= 70) {
      console.log('⚠️  脚本安全需要改进')
    } else {
      console.log('❌ 脚本安全状况较差，需要立即改进')
    }
  }

  /**
   * 计算安全分数
   */
  private calculateSafetyScore(): number {
    if (this.report.totalScripts === 0) return 100
    
    let score = 100
    
    // 不安全脚本扣分
    const unsafeRatio = this.report.unsafeScripts / this.report.totalScripts
    score -= unsafeRatio * 50
    
    // 高危违规扣分
    const highSeverityCount = this.report.violations.filter(v => v.severity === 'high').length
    score -= highSeverityCount * 20
    
    // 中危违规扣分
    const mediumSeverityCount = this.report.violations.filter(v => v.severity === 'medium').length
    score -= mediumSeverityCount * 10
    
    return Math.max(score, 0)
  }
}

/**
 * 主函数
 */
async function main() {
  const checker = new ScriptSafetyChecker()
  
  try {
    // 运行脚本安全检查
    const report = await checker.runCheck()
    
    // 打印报告
    checker.printReport()
    
    // 根据检查结果决定退出码
    if (report.unsafeScripts > 0) {
      console.log('\n❌ 脚本安全检查未通过')
      process.exit(1)
    } else {
      console.log('\n✅ 脚本安全检查通过')
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ 脚本安全检查失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

export { ScriptSafetyChecker }
