#!/usr/bin/env tsx

/**
 * 综合环境设置脚本
 * 一键设置开发、测试、生产环境
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface SetupOptions {
  environment: 'development' | 'test' | 'production' | 'all'
  skipTests?: boolean
  skipProduction?: boolean
  verbose?: boolean
  force?: boolean
}

class AllEnvironmentsSetup {
  private options: SetupOptions
  private results: Array<{ step: string; status: 'success' | 'error' | 'skipped'; message: string }> = []

  constructor(options: SetupOptions) {
    this.options = {
      skipTests: false,
      skipProduction: false,
      verbose: false,
      force: false,
      ...options
    }
  }

  /**
   * 添加结果
   */
  private addResult(step: string, status: 'success' | 'error' | 'skipped', message: string): void {
    this.results.push({ step, status, message })
  }

  /**
   * 执行命令
   */
  private async executeCommand(command: string, description: string): Promise<boolean> {
    try {
      console.log(`🔄 ${description}...`)
      execSync(command, { 
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        cwd: process.cwd()
      })
      this.addResult(description, 'success', '完成')
      console.log(`✅ ${description} 完成`)
      return true
    } catch (error) {
      this.addResult(description, 'error', error instanceof Error ? error.message : String(error))
      console.error(`❌ ${description} 失败:`, error)
      return false
    }
  }

  /**
   * 检查环境变量
   */
  async checkEnvironmentVariables(): Promise<boolean> {
    console.log('🔍 检查环境变量...')

    // 检查是否有 .env 文件
    if (!fs.existsSync('.env')) {
      if (fs.existsSync('env.template')) {
        console.log('📋 复制环境变量模板...')
        fs.copyFileSync('env.template', '.env')
        console.log('✅ 已创建 .env 文件，请编辑其中的配置')
        this.addResult('环境变量', 'success', '已创建 .env 文件')
      } else {
        console.log('⚠️ 没有找到环境变量模板文件')
        this.addResult('环境变量', 'error', '缺少环境变量模板')
        return false
      }
    } else {
      console.log('✅ .env 文件已存在')
      this.addResult('环境变量', 'success', '.env 文件存在')
    }

    return true
  }

  /**
   * 设置开发环境
   */
  async setupDevelopmentEnvironment(): Promise<boolean> {
    console.log('\n🚀 设置开发环境...')

    const steps = [
      { command: 'npm run setup:env', description: '检查环境配置' },
      { command: 'npm run setup:files', description: '设置文件系统' },
      { command: 'npm run setup:db', description: '设置数据库' }
    ]

    let allSuccess = true
    for (const step of steps) {
      const success = await this.executeCommand(step.command, step.description)
      if (!success) allSuccess = false
    }

    return allSuccess
  }

  /**
   * 设置测试环境
   */
  async setupTestEnvironment(): Promise<boolean> {
    if (this.options.skipTests) {
      console.log('\n⏭️ 跳过测试环境设置')
      this.addResult('测试环境', 'skipped', '用户选择跳过')
      return true
    }

    console.log('\n🧪 设置测试环境...')

    const steps = [
      { command: 'npm run setup:test', description: '设置测试环境' }
    ]

    let allSuccess = true
    for (const step of steps) {
      const success = await this.executeCommand(step.command, step.description)
      if (!success) allSuccess = false
    }

    return allSuccess
  }

  /**
   * 设置生产环境
   */
  async setupProductionEnvironment(): Promise<boolean> {
    if (this.options.skipProduction) {
      console.log('\n⏭️ 跳过生产环境设置')
      this.addResult('生产环境', 'skipped', '用户选择跳过')
      return true
    }

    console.log('\n🏭 设置生产环境...')

    const steps = [
      { command: 'npm run setup:production', description: '设置生产环境' }
    ]

    let allSuccess = true
    for (const step of steps) {
      const success = await this.executeCommand(step.command, step.description)
      if (!success) allSuccess = false
    }

    return allSuccess
  }

  /**
   * 运行代码质量检查
   */
  async runQualityChecks(): Promise<boolean> {
    console.log('\n🔍 运行代码质量检查...')

    const steps = [
      { command: 'npm run check-code', description: '代码质量检查' },
      { command: 'npm run type:check', description: '类型检查' },
      { command: 'npm run lint', description: '代码规范检查' }
    ]

    let allSuccess = true
    for (const step of steps) {
      const success = await this.executeCommand(step.command, step.description)
      if (!success) allSuccess = false
    }

    return allSuccess
  }

  /**
   * 生成设置报告
   */
  generateSetupReport(): string {
    const report = []
    report.push('# 环境设置报告\n')
    report.push(`生成时间: ${new Date().toISOString()}\n`)
    report.push(`设置环境: ${this.options.environment}\n`)

    report.push('## 设置步骤')
    for (const result of this.results) {
      const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏭️'
      report.push(`- ${icon} ${result.step}`)
      if (result.message) {
        report.push(`  - ${result.message}`)
      }
      report.push('')
    }

    report.push('## 统计信息')
    const totalSteps = this.results.length
    const successSteps = this.results.filter(r => r.status === 'success').length
    const errorSteps = this.results.filter(r => r.status === 'error').length
    const skippedSteps = this.results.filter(r => r.status === 'skipped').length

    report.push(`- 总步骤: ${totalSteps}`)
    report.push(`- 成功: ${successSteps}`)
    report.push(`- 失败: ${errorSteps}`)
    report.push(`- 跳过: ${skippedSteps}`)

    if (errorSteps === 0) {
      report.push('\n🎉 所有设置步骤都完成了！')
    } else {
      report.push(`\n❌ 有 ${errorSteps} 个步骤失败，请检查错误信息。`)
    }

    report.push('\n## 下一步')
    report.push('1. 检查并编辑 .env 文件中的配置')
    report.push('2. 运行 `npm run dev` 启动开发服务器')
    report.push('3. 访问 http://localhost:3000 查看应用')
    report.push('4. 运行 `npm run test` 执行测试')

    return report.join('\n')
  }

  /**
   * 显示帮助信息
   */
  showHelp(): void {
    console.log(`
🚀 AI Chat Interface 环境设置工具

用法:
  npm run setup:all [选项]

选项:
  --env <environment>    设置环境 (development|test|production|all)
  --skip-tests          跳过测试环境设置
  --skip-production     跳过生产环境设置
  --verbose             显示详细输出
  --force               强制重新设置
  --help                显示帮助信息

示例:
  npm run setup:all -- --env development
  npm run setup:all -- --skip-tests
  npm run setup:all -- --verbose
`)
  }

  /**
   * 执行完整的设置流程
   */
  async setup(): Promise<void> {
    console.log('🚀 开始环境设置...\n')

    try {
      // 1. 检查环境变量
      const envCheck = await this.checkEnvironmentVariables()
      if (!envCheck) {
        throw new Error('环境变量检查失败')
      }

      // 2. 根据选择的环境进行设置
      let allSuccess = true

      if (this.options.environment === 'development' || this.options.environment === 'all') {
        const devSuccess = await this.setupDevelopmentEnvironment()
        if (!devSuccess) allSuccess = false
      }

      if (this.options.environment === 'test' || this.options.environment === 'all') {
        const testSuccess = await this.setupTestEnvironment()
        if (!testSuccess) allSuccess = false
      }

      if (this.options.environment === 'production' || this.options.environment === 'all') {
        const prodSuccess = await this.setupProductionEnvironment()
        if (!prodSuccess) allSuccess = false
      }

      // 3. 运行代码质量检查
      const qualitySuccess = await this.runQualityChecks()
      if (!qualitySuccess) allSuccess = false

      // 4. 生成报告
      const report = this.generateSetupReport()
      fs.writeFileSync('setup-report.md', report)
      console.log('\n📄 设置报告已保存到: setup-report.md')

      // 5. 显示总结
      if (allSuccess) {
        console.log('\n🎉 环境设置完成！')
        console.log('\n📋 下一步:')
        console.log('1. 编辑 .env 文件中的配置')
        console.log('2. 运行 npm run dev 启动开发服务器')
        console.log('3. 访问 http://localhost:3000 查看应用')
      } else {
        console.log('\n⚠️ 环境设置完成，但有一些步骤失败')
        console.log('请检查 setup-report.md 了解详细信息')
      }
    } catch (error) {
      console.error('❌ 环境设置失败:', error)
      throw error
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2)
  
  // 解析命令行参数
  const options: SetupOptions = {
    environment: 'all',
    skipTests: false,
    skipProduction: false,
    verbose: false,
    force: false
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    switch (arg) {
      case '--env':
        options.environment = args[++i] as any || 'all'
        break
      case '--skip-tests':
        options.skipTests = true
        break
      case '--skip-production':
        options.skipProduction = true
        break
      case '--verbose':
        options.verbose = true
        break
      case '--force':
        options.force = true
        break
      case '--help':
        const setup = new AllEnvironmentsSetup(options)
        setup.showHelp()
        process.exit(0)
        break
    }
  }

  try {
    const setup = new AllEnvironmentsSetup(options)
    await setup.setup()
    process.exit(0)
  } catch (error) {
    console.error('设置失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

export { AllEnvironmentsSetup }
