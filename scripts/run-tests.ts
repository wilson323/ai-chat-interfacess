#!/usr/bin/env tsx

/**
 * 测试运行脚本
 * 统一管理测试执行和报告生成
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { testPerformanceConfig, testFileConfig } from '../lib/test-utils/config'

interface TestOptions {
  type: 'unit' | 'integration' | 'e2e' | 'all'
  watch: boolean
  coverage: boolean
  performance: boolean
  security: boolean
  verbose: boolean
  parallel: boolean
  maxWorkers?: number
  testPathPattern?: string
  updateSnapshots: boolean
  ci: boolean
}

class TestRunner {
  private options: TestOptions
  
  constructor(options: Partial<TestOptions> = {}) {
    this.options = {
      type: 'all',
      watch: false,
      coverage: true,
      performance: false,
      security: false,
      verbose: false,
      parallel: true,
      updateSnapshots: false,
      ci: false,
      ...options
    }
  }
  
  /**
   * 运行测试
   */
  async runTests(): Promise<void> {
    console.log('🚀 开始运行测试...')
    
    try {
      // 验证测试环境
      await this.validateTestEnvironment()
      
      // 清理测试结果
      await this.cleanupTestResults()
      
      // 根据测试类型运行测试
      switch (this.options.type) {
        case 'unit':
          await this.runUnitTests()
          break
        case 'integration':
          await this.runIntegrationTests()
          break
        case 'e2e':
          await this.runE2ETests()
          break
        case 'all':
          await this.runAllTests()
          break
      }
      
      // 生成测试报告
      await this.generateTestReport()
      
      // 性能测试
      if (this.options.performance) {
        await this.runPerformanceTests()
      }
      
      // 安全测试
      if (this.options.security) {
        await this.runSecurityTests()
      }
      
      console.log('✅ 测试完成！')
      
    } catch (error) {
      console.error('❌ 测试失败:', error)
      process.exit(1)
    }
  }
  
  /**
   * 验证测试环境
   */
  private async validateTestEnvironment(): Promise<void> {
    console.log('🔍 验证测试环境...')
    
    // 检查Node.js版本
    const nodeVersion = process.version
    const requiredVersion = '18.0.0'
    if (this.compareVersions(nodeVersion, requiredVersion) < 0) {
      throw new Error(`Node.js版本过低，需要 ${requiredVersion} 或更高版本`)
    }
    
    // 检查必要的依赖
    const requiredDeps = ['jest', '@testing-library/react', '@playwright/test']
    for (const dep of requiredDeps) {
      try {
        require.resolve(dep)
      } catch {
        throw new Error(`缺少必要的依赖: ${dep}`)
      }
    }
    
    // 检查测试文件
    const testFiles = this.findTestFiles()
    if (testFiles.length === 0) {
      console.warn('⚠️  未找到测试文件')
    }
    
    console.log('✅ 测试环境验证通过')
  }
  
  /**
   * 清理测试结果
   */
  private async cleanupTestResults(): Promise<void> {
    console.log('🧹 清理测试结果...')
    
    const dirsToClean = [
      'coverage',
      'test-results',
      'playwright-report',
      '.jest-cache'
    ]
    
    for (const dir of dirsToClean) {
      const dirPath = path.join(process.cwd(), dir)
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true })
      }
    }
    
    console.log('✅ 测试结果清理完成')
  }
  
  /**
   * 运行单元测试
   */
  private async runUnitTests(): Promise<void> {
    console.log('🧪 运行单元测试...')
    
    const jestArgs = this.buildJestArgs()
    const command = `npx jest ${jestArgs.join(' ')}`
    
    try {
      execSync(command, { stdio: 'inherit' })
      console.log('✅ 单元测试完成')
    } catch (error) {
      throw new Error('单元测试失败')
    }
  }
  
  /**
   * 运行集成测试
   */
  private async runIntegrationTests(): Promise<void> {
    console.log('🔗 运行集成测试...')
    
    const jestArgs = this.buildJestArgs(['--testPathPattern=integration'])
    const command = `npx jest ${jestArgs.join(' ')}`
    
    try {
      execSync(command, { stdio: 'inherit' })
      console.log('✅ 集成测试完成')
    } catch (error) {
      throw new Error('集成测试失败')
    }
  }
  
  /**
   * 运行E2E测试
   */
  private async runE2ETests(): Promise<void> {
    console.log('🌐 运行E2E测试...')
    
    const playwrightArgs = this.buildPlaywrightArgs()
    const command = `npx playwright test ${playwrightArgs.join(' ')}`
    
    try {
      execSync(command, { stdio: 'inherit' })
      console.log('✅ E2E测试完成')
    } catch (error) {
      throw new Error('E2E测试失败')
    }
  }
  
  /**
   * 运行所有测试
   */
  private async runAllTests(): Promise<void> {
    console.log('🎯 运行所有测试...')
    
    // 先运行单元测试
    await this.runUnitTests()
    
    // 再运行集成测试
    await this.runIntegrationTests()
    
    // 最后运行E2E测试
    await this.runE2ETests()
  }
  
  /**
   * 运行性能测试
   */
  private async runPerformanceTests(): Promise<void> {
    console.log('⚡ 运行性能测试...')
    
    const performanceTestFile = path.join(__dirname, '../__tests__/performance.test.ts')
    if (!fs.existsSync(performanceTestFile)) {
      console.log('⚠️  性能测试文件不存在，跳过性能测试')
      return
    }
    
    const command = `npx jest ${performanceTestFile} --verbose`
    
    try {
      execSync(command, { stdio: 'inherit' })
      console.log('✅ 性能测试完成')
    } catch (error) {
      console.warn('⚠️  性能测试失败，但不影响整体测试结果')
    }
  }
  
  /**
   * 运行安全测试
   */
  private async runSecurityTests(): Promise<void> {
    console.log('🔒 运行安全测试...')
    
    const securityTestFile = path.join(__dirname, '../__tests__/security.test.ts')
    if (!fs.existsSync(securityTestFile)) {
      console.log('⚠️  安全测试文件不存在，跳过安全测试')
      return
    }
    
    const command = `npx jest ${securityTestFile} --verbose`
    
    try {
      execSync(command, { stdio: 'inherit' })
      console.log('✅ 安全测试完成')
    } catch (error) {
      console.warn('⚠️  安全测试失败，但不影响整体测试结果')
    }
  }
  
  /**
   * 构建Jest参数
   */
  private buildJestArgs(additionalArgs: string[] = []): string[] {
    const args = [...additionalArgs]
    
    if (this.options.watch) {
      args.push('--watch')
    }
    
    if (this.options.coverage) {
      args.push('--coverage')
    }
    
    if (this.options.verbose) {
      args.push('--verbose')
    }
    
    if (this.options.parallel) {
      args.push('--runInBand=false')
    }
    
    if (this.options.maxWorkers) {
      args.push(`--maxWorkers=${this.options.maxWorkers}`)
    }
    
    if (this.options.testPathPattern) {
      args.push(`--testPathPattern=${this.options.testPathPattern}`)
    }
    
    if (this.options.updateSnapshots) {
      args.push('--updateSnapshot')
    }
    
    if (this.options.ci) {
      args.push('--ci')
    }
    
    return args
  }
  
  /**
   * 构建Playwright参数
   */
  private buildPlaywrightArgs(): string[] {
    const args = []
    
    if (this.options.verbose) {
      args.push('--reporter=line')
    }
    
    if (this.options.ci) {
      args.push('--reporter=github')
    }
    
    return args
  }
  
  /**
   * 生成测试报告
   */
  private async generateTestReport(): Promise<void> {
    console.log('📊 生成测试报告...')
    
    const reportDir = path.join(process.cwd(), 'test-results')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    
    // 生成Jest报告
    const jestReportPath = path.join(reportDir, 'jest-report.json')
    if (fs.existsSync('coverage/coverage-summary.json')) {
      const coverageData = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'))
      fs.writeFileSync(jestReportPath, JSON.stringify(coverageData, null, 2))
    }
    
    // 生成Playwright报告
    const playwrightReportPath = path.join(reportDir, 'playwright-report.json')
    if (fs.existsSync('test-results.json')) {
      const playwrightData = JSON.parse(fs.readFileSync('test-results.json', 'utf8'))
      fs.writeFileSync(playwrightReportPath, JSON.stringify(playwrightData, null, 2))
    }
    
    console.log('✅ 测试报告生成完成')
  }
  
  /**
   * 查找测试文件
   */
  private findTestFiles(): string[] {
    const testFiles: string[] = []
    const testDirs = testFileConfig.testDirs
    
    for (const dir of testDirs) {
      const dirPath = path.join(process.cwd(), dir)
      if (fs.existsSync(dirPath)) {
        this.findFilesInDir(dirPath, testFiles)
      }
    }
    
    return testFiles
  }
  
  /**
   * 递归查找测试文件
   */
  private findFilesInDir(dirPath: string, testFiles: string[]): void {
    const files = fs.readdirSync(dirPath)
    
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        this.findFilesInDir(filePath, testFiles)
      } else if (testFileConfig.testFilePattern.test(file)) {
        testFiles.push(filePath)
      }
    }
  }
  
  /**
   * 比较版本号
   */
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.replace('v', '').split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0
      
      if (v1Part > v2Part) return 1
      if (v1Part < v2Part) return -1
    }
    
    return 0
  }
}

// 命令行参数解析
function parseArgs(): Partial<TestOptions> {
  const args = process.argv.slice(2)
  const options: Partial<TestOptions> = {}
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--type':
        options.type = args[++i] as TestOptions['type']
        break
      case '--watch':
        options.watch = true
        break
      case '--coverage':
        options.coverage = true
        break
      case '--performance':
        options.performance = true
        break
      case '--security':
        options.security = true
        break
      case '--verbose':
        options.verbose = true
        break
      case '--parallel':
        options.parallel = true
        break
      case '--maxWorkers':
        options.maxWorkers = parseInt(args[++i])
        break
      case '--testPathPattern':
        options.testPathPattern = args[++i]
        break
      case '--updateSnapshots':
        options.updateSnapshots = true
        break
      case '--ci':
        options.ci = true
        break
      case '--help':
        console.log(`
测试运行脚本

用法: tsx scripts/run-tests.ts [选项]

选项:
  --type <type>           测试类型 (unit|integration|e2e|all)
  --watch                 监视模式
  --coverage              生成覆盖率报告
  --performance           运行性能测试
  --security              运行安全测试
  --verbose               详细输出
  --parallel              并行运行
  --maxWorkers <number>   最大工作进程数
  --testPathPattern <pattern> 测试文件匹配模式
  --updateSnapshots       更新快照
  --ci                    CI模式
  --help                  显示帮助信息

示例:
  tsx scripts/run-tests.ts --type unit --coverage
  tsx scripts/run-tests.ts --type e2e --verbose
  tsx scripts/run-tests.ts --type all --performance --security
`)
        process.exit(0)
        break
    }
  }
  
  return options
}

// 主函数
async function main() {
  const options = parseArgs()
  const runner = new TestRunner(options)
  
  try {
    await runner.runTests()
  } catch (error) {
    console.error('测试运行失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

export default TestRunner
