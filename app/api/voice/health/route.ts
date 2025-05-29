/**
 * 语音服务健康检查 API
 * 监控语音服务的可用性和性能
 */

import { NextRequest, NextResponse } from 'next/server'
import { VOICE_CONSTANTS } from '@/types/voice'

/**
 * GET /api/voice/health
 * 获取服务健康状态
 */
export async function GET() {
  try {
    const healthStatus = await performHealthCheck()
    
    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'healthy' ? 200 : 503,
    })
  } catch (error) {
    return NextResponse.json({
      service: 'voice-health',
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
    }, { status: 500 })
  }
}

/**
 * POST /api/voice/health
 * 测试特定配置的连接
 */
export async function POST(request: NextRequest) {
  try {
    const { apiUrl, apiKey } = await request.json()
    
    if (!apiUrl || !apiKey) {
      return NextResponse.json({
        error: 'Missing apiUrl or apiKey',
      }, { status: 400 })
    }

    const testResult = await testConnection(apiUrl, apiKey)
    
    return NextResponse.json({
      service: 'voice-connection-test',
      timestamp: new Date().toISOString(),
      ...testResult,
    })
  } catch (error) {
    return NextResponse.json({
      service: 'voice-connection-test',
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Connection test failed',
    }, { status: 500 })
  }
}

/**
 * 执行健康检查
 */
async function performHealthCheck() {
  const timestamp = new Date().toISOString()
  const checks: Record<string, any> = {}

  // 检查环境变量配置
  checks.config = checkConfiguration()
  
  // 检查 API 连接
  checks.apiConnection = await checkApiConnection()
  
  // 检查系统资源
  checks.system = checkSystemResources()
  
  // 检查依赖服务
  checks.dependencies = await checkDependencies()

  // 计算总体状态
  const allHealthy = Object.values(checks).every(check => check.status === 'healthy')
  const hasErrors = Object.values(checks).some(check => check.status === 'error')
  
  const overallStatus = allHealthy ? 'healthy' : hasErrors ? 'error' : 'degraded'

  return {
    service: 'voice-service',
    status: overallStatus,
    timestamp,
    version: '1.0.0',
    uptime: process.uptime(),
    checks,
    summary: generateHealthSummary(checks),
  }
}

/**
 * 检查配置
 */
function checkConfiguration() {
  const apiUrl = process.env.OPENAI_AUDIO_API_URL
  const apiKey = process.env.OPENAI_AUDIO_API_KEY

  const issues: string[] = []
  
  if (!apiUrl) {
    issues.push('OPENAI_AUDIO_API_URL not configured')
  }
  
  if (!apiKey || apiKey === 'sk-xx') {
    issues.push('OPENAI_AUDIO_API_KEY not configured or using default value')
  }

  return {
    status: issues.length === 0 ? 'healthy' : 'error',
    details: {
      hasApiUrl: !!apiUrl,
      hasApiKey: !!apiKey && apiKey !== 'sk-xx',
      maxFileSize: VOICE_CONSTANTS.MAX_FILE_SIZE,
      requestTimeout: VOICE_CONSTANTS.REQUEST_TIMEOUT,
    },
    issues,
  }
}

/**
 * 检查 API 连接
 */
async function checkApiConnection() {
  const apiUrl = process.env.OPENAI_AUDIO_API_URL
  const apiKey = process.env.OPENAI_AUDIO_API_KEY

  if (!apiUrl || !apiKey || apiKey === 'sk-xx') {
    return {
      status: 'error',
      message: 'API configuration missing',
    }
  }

  try {
    const startTime = Date.now()
    
    // 尝试访问模型列表端点（不需要上传文件）
    const modelsUrl = apiUrl.replace('/transcriptions', '/models')
    const response = await fetch(modelsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000),
    })

    const responseTime = Date.now() - startTime

    if (response.ok) {
      return {
        status: 'healthy',
        responseTime,
        details: {
          statusCode: response.status,
          url: modelsUrl,
        },
      }
    } else {
      return {
        status: 'error',
        responseTime,
        details: {
          statusCode: response.status,
          statusText: response.statusText,
          url: modelsUrl,
        },
      }
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}

/**
 * 检查系统资源
 */
function checkSystemResources() {
  const memoryUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()

  // 简单的内存使用检查
  const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024
  const memoryLimitMB = 512 // 假设限制为 512MB

  return {
    status: memoryUsageMB < memoryLimitMB ? 'healthy' : 'warning',
    details: {
      memory: {
        used: Math.round(memoryUsageMB),
        limit: memoryLimitMB,
        percentage: Math.round((memoryUsageMB / memoryLimitMB) * 100),
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: process.uptime(),
    },
  }
}

/**
 * 检查依赖服务
 */
async function checkDependencies() {
  const dependencies = []

  // 检查 Node.js 版本
  const nodeVersion = process.version
  const requiredNodeVersion = '18.0.0'
  
  dependencies.push({
    name: 'Node.js',
    version: nodeVersion,
    required: `>=${requiredNodeVersion}`,
    status: compareVersions(nodeVersion.slice(1), requiredNodeVersion) >= 0 ? 'healthy' : 'error',
  })

  // 检查关键模块
  try {
    require('fs')
    dependencies.push({
      name: 'File System',
      status: 'healthy',
    })
  } catch {
    dependencies.push({
      name: 'File System',
      status: 'error',
    })
  }

  const allHealthy = dependencies.every(dep => dep.status === 'healthy')
  
  return {
    status: allHealthy ? 'healthy' : 'error',
    dependencies,
  }
}

/**
 * 测试连接
 */
async function testConnection(apiUrl: string, apiKey: string) {
  try {
    const startTime = Date.now()
    
    const response = await fetch(apiUrl.replace('/transcriptions', '/models'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(10000),
    })

    const responseTime = Date.now() - startTime

    return {
      status: response.ok ? 'success' : 'error',
      responseTime,
      statusCode: response.status,
      statusText: response.statusText,
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 生成健康摘要
 */
function generateHealthSummary(checks: Record<string, any>) {
  const total = Object.keys(checks).length
  const healthy = Object.values(checks).filter(check => check.status === 'healthy').length
  const warnings = Object.values(checks).filter(check => check.status === 'warning').length
  const errors = Object.values(checks).filter(check => check.status === 'error').length

  return {
    total,
    healthy,
    warnings,
    errors,
    healthPercentage: Math.round((healthy / total) * 100),
  }
}

/**
 * 比较版本号
 */
function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number)
  const v2Parts = version2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0
    const v2Part = v2Parts[i] || 0
    
    if (v1Part > v2Part) return 1
    if (v1Part < v2Part) return -1
  }
  
  return 0
}
