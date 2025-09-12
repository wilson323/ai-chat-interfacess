#!/usr/bin/env node
/**
 * 环境配置检查脚本
 * 检查环境变量配置的完整性和正确性
 */

import { appConfig, validateConfig } from '../lib/config'

function checkEnvironmentConfig() {
  console.log('🔍 检查环境配置...\n')

  try {
    // 验证必需的环境变量
    validateConfig()
    
    // 显示当前配置
    console.log('📊 当前配置信息:')
    console.log('=' .repeat(50))
    
    // 数据库配置
    console.log('🗄️  数据库配置:')
    console.log(`  Host: ${appConfig.database.host}`)
    console.log(`  Port: ${appConfig.database.port}`)
    console.log(`  Database: ${appConfig.database.database}`)
    console.log(`  Username: ${appConfig.database.username}`)
    console.log(`  SSL: ${appConfig.database.ssl}`)
    console.log(`  Pool Max: ${appConfig.database.pool.max}`)
    console.log(`  Pool Min: ${appConfig.database.pool.min}`)
    
    // API配置
    console.log('\n🌐 API配置:')
    console.log(`  Base URL: ${appConfig.api.baseUrl}`)
    console.log(`  Timeout: ${appConfig.api.timeout}ms`)
    console.log(`  Retries: ${appConfig.api.retries}`)
    console.log(`  Rate Limit: ${appConfig.api.rateLimit.max} requests per ${appConfig.api.rateLimit.windowMs / 1000}s`)
    
    // 功能配置
    console.log('\n⚙️  功能配置:')
    console.log(`  Voice: ${appConfig.features.enableVoice ? '✅' : '❌'}`)
    console.log(`  File Upload: ${appConfig.features.enableFileUpload ? '✅' : '❌'}`)
    console.log(`  Image Upload: ${appConfig.features.enableImageUpload ? '✅' : '❌'}`)
    console.log(`  Streaming: ${appConfig.features.enableStreaming ? '✅' : '❌'}`)
    console.log(`  Max File Size: ${(appConfig.features.maxFileSize / 1024 / 1024).toFixed(2)}MB`)
    console.log(`  Allowed Types: ${appConfig.features.allowedFileTypes.join(', ')}`)
    
    // 安全配置
    console.log('\n🔒 安全配置:')
    console.log(`  JWT Secret: ${appConfig.security.jwtSecret ? '✅ 已设置' : '❌ 未设置'}`)
    console.log(`  JWT Expires: ${appConfig.security.jwtExpiresIn}`)
    console.log(`  Bcrypt Rounds: ${appConfig.security.bcryptRounds}`)
    console.log(`  CORS Origins: ${appConfig.security.corsOrigins.join(', ')}`)
    console.log(`  Rate Limit: ${appConfig.security.rateLimitEnabled ? '✅' : '❌'}`)
    
    // Redis配置
    console.log('\n📦 Redis配置:')
    console.log(`  Host: ${appConfig.redis.host}`)
    console.log(`  Port: ${appConfig.redis.port}`)
    console.log(`  Database: ${appConfig.redis.db}`)
    console.log(`  Password: ${appConfig.redis.password ? '✅ 已设置' : '❌ 未设置'}`)
    
    // 存储配置
    console.log('\n💾 存储配置:')
    console.log(`  Upload Path: ${appConfig.storage.uploadPath}`)
    console.log(`  Temp Path: ${appConfig.storage.tempPath}`)
    console.log(`  Provider: ${appConfig.storage.provider}`)
    
    // 监控配置
    console.log('\n📊 监控配置:')
    console.log(`  Enabled: ${appConfig.monitoring.enabled ? '✅' : '❌'}`)
    console.log(`  Endpoint: ${appConfig.monitoring.endpoint}`)
    console.log(`  Log Level: ${appConfig.monitoring.logLevel}`)
    
    console.log('\n✅ 环境配置检查完成！')
    
  } catch (error) {
    console.error('\n❌ 环境配置检查失败:')
    console.error(error.message)
    console.error('\n请参考 docs/环境配置管理规范.md 配置环境变量')
    process.exit(1)
  }
}

// 运行检查
if (require.main === module) {
  checkEnvironmentConfig()
}

export { checkEnvironmentConfig }

