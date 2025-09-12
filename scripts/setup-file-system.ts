#!/usr/bin/env tsx

/**
 * 文件系统设置脚本
 * 用于创建必要的目录、检查权限、设置文件系统结构
 */

import fs from 'fs'
import path from 'path'
import { appConfig } from '@/lib/config'

interface DirectoryConfig {
  path: string
  permissions: string
  description: string
  required: boolean
}

interface FileSystemSetupOptions {
  createDirectories?: boolean
  checkPermissions?: boolean
  verbose?: boolean
  force?: boolean
}

class FileSystemSetup {
  private options: FileSystemSetupOptions
  private directories: DirectoryConfig[]

  constructor(options: FileSystemSetupOptions = {}) {
    this.options = {
      createDirectories: true,
      checkPermissions: true,
      verbose: false,
      force: false,
      ...options
    }

    // 定义需要创建的目录
    this.directories = [
      {
        path: 'public/image-edits',
        permissions: '755',
        description: '图像编辑文件存储目录',
        required: true
      },
      {
        path: 'public/cad-files',
        permissions: '755',
        description: 'CAD文件存储目录',
        required: true
      },
      {
        path: 'public/uploads',
        permissions: '755',
        description: '通用文件上传目录',
        required: true
      },
      {
        path: appConfig.storage.uploadPath,
        permissions: '755',
        description: '配置的上传目录',
        required: true
      },
      {
        path: appConfig.storage.tempPath,
        permissions: '755',
        description: '临时文件目录',
        required: true
      },
      {
        path: 'logs',
        permissions: '755',
        description: '日志文件目录',
        required: false
      },
      {
        path: 'backups',
        permissions: '755',
        description: '数据库备份目录',
        required: false
      },
      {
        path: 'data',
        permissions: '755',
        description: '数据文件目录',
        required: false
      }
    ]
  }

  /**
   * 检查目录是否存在
   */
  private checkDirectoryExists(dirPath: string): boolean {
    try {
      return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()
    } catch (error) {
      return false
    }
  }

  /**
   * 创建目录
   */
  private async createDirectory(dirPath: string, permissions: string): Promise<boolean> {
    try {
      // 检查父目录是否存在
      const parentDir = path.dirname(dirPath)
      if (!this.checkDirectoryExists(parentDir)) {
        await this.createDirectory(parentDir, permissions)
      }

      // 创建目录
      fs.mkdirSync(dirPath, { recursive: true, mode: parseInt(permissions, 8) })
      
      if (this.options.verbose) {
        console.log(`  ✅ 创建目录: ${dirPath}`)
      }
      return true
    } catch (error) {
      console.error(`  ❌ 创建目录失败: ${dirPath}`, error)
      return false
    }
  }

  /**
   * 检查目录权限
   */
  private checkDirectoryPermissions(dirPath: string): boolean {
    try {
      if (!this.checkDirectoryExists(dirPath)) {
        return false
      }

      // 检查读权限
      fs.accessSync(dirPath, fs.constants.R_OK)
      
      // 检查写权限
      fs.accessSync(dirPath, fs.constants.W_OK)
      
      // 检查执行权限
      fs.accessSync(dirPath, fs.constants.X_OK)
      
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 获取目录权限
   */
  private getDirectoryPermissions(dirPath: string): string {
    try {
      const stats = fs.statSync(dirPath)
      const mode = stats.mode & parseInt('777', 8)
      return mode.toString(8).padStart(3, '0')
    } catch (error) {
      return '000'
    }
  }

  /**
   * 创建 .gitkeep 文件
   */
  private createGitKeep(dirPath: string): void {
    try {
      const gitKeepPath = path.join(dirPath, '.gitkeep')
      if (!fs.existsSync(gitKeepPath)) {
        fs.writeFileSync(gitKeepPath, '# 保持目录在Git中\n')
      }
    } catch (error) {
      console.warn(`创建 .gitkeep 失败: ${dirPath}`, error)
    }
  }

  /**
   * 创建目录结构
   */
  async createDirectories(): Promise<{ success: number; failed: number }> {
    if (!this.options.createDirectories) {
      console.log('⏭️ 跳过目录创建')
      return { success: 0, failed: 0 }
    }

    console.log('📁 创建目录结构...')

    let success = 0
    let failed = 0

    for (const dir of this.directories) {
      try {
        if (this.checkDirectoryExists(dir.path)) {
          if (this.options.verbose) {
            console.log(`  ℹ️ 目录已存在: ${dir.path}`)
          }
          success++
          continue
        }

        const created = await this.createDirectory(dir.path, dir.permissions)
        if (created) {
          // 创建 .gitkeep 文件
          this.createGitKeep(dir.path)
          success++
        } else {
          failed++
        }
      } catch (error) {
        console.error(`  ❌ 处理目录失败: ${dir.path}`, error)
        failed++
      }
    }

    console.log(`✅ 目录创建完成: 成功 ${success} 个, 失败 ${failed} 个`)
    return { success, failed }
  }

  /**
   * 检查目录权限
   */
  async checkPermissions(): Promise<{ valid: number; invalid: number }> {
    if (!this.options.checkPermissions) {
      console.log('⏭️ 跳过权限检查')
      return { valid: 0, invalid: 0 }
    }

    console.log('🔐 检查目录权限...')

    let valid = 0
    let invalid = 0

    for (const dir of this.directories) {
      try {
        if (!this.checkDirectoryExists(dir.path)) {
          if (dir.required) {
            console.log(`  ❌ 必需目录不存在: ${dir.path}`)
            invalid++
          } else {
            console.log(`  ⚠️ 可选目录不存在: ${dir.path}`)
          }
          continue
        }

        const hasPermissions = this.checkDirectoryPermissions(dir.path)
        const currentPermissions = this.getDirectoryPermissions(dir.path)
        
        if (hasPermissions) {
          console.log(`  ✅ ${dir.path} (权限: ${currentPermissions})`)
          valid++
        } else {
          console.log(`  ❌ ${dir.path} (权限: ${currentPermissions}) - 权限不足`)
          invalid++
        }
      } catch (error) {
        console.error(`  ❌ 检查权限失败: ${dir.path}`, error)
        invalid++
      }
    }

    console.log(`✅ 权限检查完成: 有效 ${valid} 个, 无效 ${invalid} 个`)
    return { valid, invalid }
  }

  /**
   * 创建示例文件
   */
  async createSampleFiles(): Promise<void> {
    console.log('📄 创建示例文件...')

    const sampleFiles = [
      {
        path: 'public/uploads/.gitkeep',
        content: '# 上传文件目录\n'
      },
      {
        path: 'public/image-edits/.gitkeep',
        content: '# 图像编辑文件目录\n'
      },
      {
        path: 'public/cad-files/.gitkeep',
        content: '# CAD文件目录\n'
      },
      {
        path: 'logs/.gitkeep',
        content: '# 日志文件目录\n'
      },
      {
        path: 'backups/.gitkeep',
        content: '# 数据库备份目录\n'
      }
    ]

    for (const file of sampleFiles) {
      try {
        const dir = path.dirname(file.path)
        if (!this.checkDirectoryExists(dir)) {
          await this.createDirectory(dir, '755')
        }

        if (!fs.existsSync(file.path)) {
          fs.writeFileSync(file.path, file.content)
          if (this.options.verbose) {
            console.log(`  ✅ 创建文件: ${file.path}`)
          }
        }
      } catch (error) {
        console.error(`  ❌ 创建文件失败: ${file.path}`, error)
      }
    }
  }

  /**
   * 验证文件系统结构
   */
  async validateFileSystem(): Promise<boolean> {
    console.log('🔍 验证文件系统结构...')

    let allValid = true

    for (const dir of this.directories) {
      if (!dir.required) continue

      const exists = this.checkDirectoryExists(dir.path)
      const hasPermissions = exists ? this.checkDirectoryPermissions(dir.path) : false

      if (!exists) {
        console.log(`  ❌ 必需目录不存在: ${dir.path}`)
        allValid = false
      } else if (!hasPermissions) {
        console.log(`  ❌ 目录权限不足: ${dir.path}`)
        allValid = false
      } else {
        console.log(`  ✅ ${dir.path}`)
      }
    }

    if (allValid) {
      console.log('✅ 文件系统结构验证通过')
    } else {
      console.log('❌ 文件系统结构验证失败')
    }

    return allValid
  }

  /**
   * 生成文件系统报告
   */
  generateReport(): string {
    const report = []
    report.push('# 文件系统设置报告\n')

    report.push('## 目录结构')
    for (const dir of this.directories) {
      const exists = this.checkDirectoryExists(dir.path)
      const permissions = exists ? this.getDirectoryPermissions(dir.path) : 'N/A'
      const status = exists ? '✅' : '❌'
      
      report.push(`- ${status} ${dir.path}`)
      report.push(`  - 描述: ${dir.description}`)
      report.push(`  - 权限: ${permissions}`)
      report.push(`  - 必需: ${dir.required ? '是' : '否'}`)
      report.push('')
    }

    report.push('## 配置信息')
    report.push(`- 上传目录: ${appConfig.storage.uploadPath}`)
    report.push(`- 临时目录: ${appConfig.storage.tempPath}`)
    report.push(`- 最大文件大小: ${appConfig.features.maxFileSize} 字节`)
    report.push(`- 允许的文件类型: ${appConfig.features.allowedFileTypes.join(', ')}`)

    return report.join('\n')
  }

  /**
   * 执行完整的文件系统设置
   */
  async setup(): Promise<void> {
    console.log('🚀 开始文件系统设置...')

    try {
      // 1. 创建目录
      const createResult = await this.createDirectories()
      if (createResult.failed > 0) {
        console.warn(`⚠️ ${createResult.failed} 个目录创建失败`)
      }

      // 2. 检查权限
      const permissionResult = await this.checkPermissions()
      if (permissionResult.invalid > 0) {
        console.warn(`⚠️ ${permissionResult.invalid} 个目录权限无效`)
      }

      // 3. 创建示例文件
      await this.createSampleFiles()

      // 4. 验证文件系统
      const valid = await this.validateFileSystem()
      if (!valid) {
        throw new Error('文件系统验证失败')
      }

      console.log('🎉 文件系统设置完成!')
    } catch (error) {
      console.error('❌ 文件系统设置失败:', error)
      throw error
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2)
  const options: FileSystemSetupOptions = {
    createDirectories: !args.includes('--no-create'),
    checkPermissions: !args.includes('--no-check'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force')
  }

  try {
    const setup = new FileSystemSetup(options)
    await setup.setup()
    
    if (args.includes('--report')) {
      console.log('\n' + setup.generateReport())
    }
    
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

export { FileSystemSetup }
