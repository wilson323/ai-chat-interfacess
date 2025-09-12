/**
 * 依赖清理脚本
 * 分析并移除未使用的依赖包
 */

import fs from 'fs'
import path from 'path'

interface DependencyInfo {
  name: string
  version: string
  used: boolean
  usageCount: number
  files: string[]
}

class DependencyCleaner {
  private packageJsonPath: string
  private packageJson: any
  private dependencies: DependencyInfo[] = []
  private devDependencies: DependencyInfo[] = []

  constructor() {
    this.packageJsonPath = path.join(process.cwd(), 'package.json')
    this.loadPackageJson()
  }

  private loadPackageJson() {
    try {
      const content = fs.readFileSync(this.packageJsonPath, 'utf-8')
      this.packageJson = JSON.parse(content)
    } catch (error) {
      console.error('❌ 无法读取 package.json:', error)
      process.exit(1)
    }
  }

  private savePackageJson() {
    try {
      const content = JSON.stringify(this.packageJson, null, 2) + '\n'
      fs.writeFileSync(this.packageJsonPath, content, 'utf-8')
      console.log('✅ package.json 已更新')
    } catch (error) {
      console.error('❌ 无法保存 package.json:', error)
    }
  }

  private async scanForUsage(depName: string): Promise<{ used: boolean; usageCount: number; files: string[] }> {
    const files: string[] = []
    let usageCount = 0

    // 扫描所有相关文件
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']
    const dirs = ['components', 'lib', 'app', 'pages', 'scripts', 'hooks', 'context', 'types']

    for (const dir of dirs) {
      const dirPath = path.join(process.cwd(), dir)
      if (fs.existsSync(dirPath)) {
        await this.scanDirectory(dirPath, depName, files, usageCount)
      }
    }

    // 扫描根目录文件
    const rootFiles = ['next.config.js', 'tailwind.config.js', 'jest.config.js', 'jest.setup.js']
    for (const file of rootFiles) {
      const filePath = path.join(process.cwd(), file)
      if (fs.existsSync(filePath)) {
        await this.scanFile(filePath, depName, files, usageCount)
      }
    }

    return {
      used: files.length > 0,
      usageCount,
      files
    }
  }

  private async scanDirectory(dirPath: string, depName: string, files: string[], usageCount: number) {
    const items = fs.readdirSync(dirPath)
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        await this.scanDirectory(itemPath, depName, files, usageCount)
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx|json)$/.test(item)) {
        await this.scanFile(itemPath, depName, files, usageCount)
      }
    }
  }

  private async scanFile(filePath: string, depName: string, files: string[], usageCount: number) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      
      // 检查各种导入模式
      const patterns = [
        new RegExp(`from\\s+['"]${depName}['"]`, 'g'),
        new RegExp(`import\\s+.*\\s+from\\s+['"]${depName}['"]`, 'g'),
        new RegExp(`require\\s*\\(\\s*['"]${depName}['"]\\s*\\)`, 'g'),
        new RegExp(`['"]${depName}['"]`, 'g')
      ]

      for (const pattern of patterns) {
        const matches = content.match(pattern)
        if (matches) {
          usageCount += matches.length
          if (!files.includes(filePath)) {
            files.push(filePath)
          }
        }
      }
    } catch (error) {
      // 忽略读取错误
    }
  }

  private async analyzeDependencies() {
    console.log('🔍 分析依赖使用情况...')

    // 分析生产依赖
    for (const [name, version] of Object.entries(this.packageJson.dependencies || {})) {
      const usage = await this.scanForUsage(name)
      this.dependencies.push({
        name,
        version: version as string,
        used: usage.used,
        usageCount: usage.usageCount,
        files: usage.files
      })
    }

    // 分析开发依赖
    for (const [name, version] of Object.entries(this.packageJson.devDependencies || {})) {
      const usage = await this.scanForUsage(name)
      this.devDependencies.push({
        name,
        version: version as string,
        used: usage.used,
        usageCount: usage.usageCount,
        files: usage.files
      })
    }
  }

  private generateReport() {
    console.log('\n📊 依赖使用情况报告')
    console.log('=' .repeat(50))

    // 未使用的生产依赖
    const unusedDeps = this.dependencies.filter(dep => !dep.used)
    if (unusedDeps.length > 0) {
      console.log('\n❌ 未使用的生产依赖:')
      unusedDeps.forEach(dep => {
        console.log(`  - ${dep.name}@${dep.version}`)
      })
    }

    // 未使用的开发依赖
    const unusedDevDeps = this.devDependencies.filter(dep => !dep.used)
    if (unusedDevDeps.length > 0) {
      console.log('\n❌ 未使用的开发依赖:')
      unusedDevDeps.forEach(dep => {
        console.log(`  - ${dep.name}@${dep.version}`)
      })
    }

    // 使用统计
    const usedDeps = this.dependencies.filter(dep => dep.used).length
    const usedDevDeps = this.devDependencies.filter(dep => dep.used).length
    const totalDeps = this.dependencies.length + this.devDependencies.length
    const totalUsed = usedDeps + usedDevDeps

    console.log('\n📈 使用统计:')
    console.log(`  总依赖数: ${totalDeps}`)
    console.log(`  已使用: ${totalUsed}`)
    console.log(`  未使用: ${totalDeps - totalUsed}`)
    console.log(`  使用率: ${((totalUsed / totalDeps) * 100).toFixed(1)}%`)

    return { unusedDeps, unusedDevDeps }
  }

  private async removeUnusedDependencies(unusedDeps: DependencyInfo[], unusedDevDeps: DependencyInfo[]) {
    if (unusedDeps.length === 0 && unusedDevDeps.length === 0) {
      console.log('\n✅ 没有发现未使用的依赖')
      return
    }

    console.log('\n🗑️  移除未使用的依赖...')

    // 移除未使用的生产依赖
    for (const dep of unusedDeps) {
      delete this.packageJson.dependencies[dep.name]
      console.log(`  - 移除生产依赖: ${dep.name}`)
    }

    // 移除未使用的开发依赖
    for (const dep of unusedDevDeps) {
      delete this.packageJson.devDependencies[dep.name]
      console.log(`  - 移除开发依赖: ${dep.name}`)
    }

    this.savePackageJson()
  }

  public async run() {
    console.log('🧹 开始清理项目依赖...')
    
    await this.analyzeDependencies()
    const { unusedDeps, unusedDevDeps } = this.generateReport()
    
    // 询问是否移除未使用的依赖
    if (unusedDeps.length > 0 || unusedDevDeps.length > 0) {
      console.log('\n⚠️  发现未使用的依赖，建议移除以保持项目纯净')
      await this.removeUnusedDependencies(unusedDeps, unusedDevDeps)
    }

    console.log('\n✅ 依赖清理完成!')
  }
}

// 运行清理
const cleaner = new DependencyCleaner()
cleaner.run().catch(console.error)
