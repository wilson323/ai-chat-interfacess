import { NextRequest, NextResponse } from 'next/server'
import { SecurityScanner, type SecurityScanResult } from '@/lib/security/security-scanner'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { glob } from 'glob'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scanType = 'full', filePaths = [] } = body

    const scanner = new SecurityScanner()
    const results: SecurityScanResult[] = []

    // 确定要扫描的文件
    let filesToScan: string[] = []

    if (filePaths.length > 0) {
      filesToScan = filePaths
    } else {
      // 扫描所有相关文件
      const patterns = [
        'app/**/*.ts',
        'app/**/*.tsx',
        'app/**/*.js',
        'app/**/*.jsx',
        'components/**/*.ts',
        'components/**/*.tsx',
        'lib/**/*.ts',
        'hooks/**/*.ts',
        'utils/**/*.ts',
        'middleware.ts',
        'next.config.*'
      ]

      for (const pattern of patterns) {
        const files = await glob(pattern, { cwd: process.cwd() })
        filesToScan.push(...files)
      }
    }

    // 扫描每个文件
    for (const filePath of filesToScan) {
      try {
        const fullPath = join(process.cwd(), filePath)
        const content = await readFile(fullPath, 'utf-8')
        const issues = await scanner.scanCode(content, filePath)
        
        if (issues.length > 0) {
          const report = scanner.generateReport()
          results.push(report)
        }
      } catch (error) {
        console.warn(`无法扫描文件 ${filePath}:`, error)
      }
    }

    // 合并所有结果
    const allIssues = results.flatMap(r => r.issues)
    const totalIssues = allIssues.length
    const criticalIssues = allIssues.filter(i => i.severity === 'critical').length
    const highIssues = allIssues.filter(i => i.severity === 'high').length
    const mediumIssues = allIssues.filter(i => i.severity === 'medium').length
    const lowIssues = allIssues.filter(i => i.severity === 'low').length

    // 计算总体评分
    const score = Math.max(0, 100 - (criticalIssues * 20 + highIssues * 10 + mediumIssues * 5 + lowIssues * 2))
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'

    // 生成建议
    const recommendations = generateOverallRecommendations(allIssues)

    const finalReport: SecurityScanResult = {
      timestamp: Date.now(),
      totalIssues,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      issues: allIssues,
      summary: {
        score,
        grade,
        recommendations
      }
    }

    return NextResponse.json({
      success: true,
      data: finalReport,
      scannedFiles: filesToScan.length
    })
  } catch (error) {
    console.error('安全扫描失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '安全扫描失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

/**
 * 生成总体修复建议
 */
function generateOverallRecommendations(issues: any[]): string[] {
  const recommendations: string[] = []
  
  // 按严重程度排序的建议
  if (issues.some(i => i.severity === 'critical')) {
    recommendations.push('🚨 立即修复所有关键安全漏洞')
  }
  
  if (issues.some(i => i.severity === 'high')) {
    recommendations.push('⚠️ 优先修复高风险安全问题')
  }
  
  // 按漏洞类型分类的建议
  const vulnerabilityTypes = new Set(issues.map(i => i.title))
  
  if (vulnerabilityTypes.has('SQL注入漏洞')) {
    recommendations.push('🔒 实施参数化查询防止SQL注入攻击')
  }
  
  if (vulnerabilityTypes.has('跨站脚本攻击(XSS)漏洞')) {
    recommendations.push('🛡️ 对用户输入进行适当的转义和验证')
  }
  
  if (vulnerabilityTypes.has('跨站请求伪造(CSRF)漏洞')) {
    recommendations.push('🔐 实施CSRF令牌验证机制')
  }
  
  if (vulnerabilityTypes.has('敏感数据泄露')) {
    recommendations.push('🔑 使用环境变量存储敏感信息，避免硬编码')
  }
  
  if (vulnerabilityTypes.has('缺少函数级访问控制')) {
    recommendations.push('👤 实施适当的身份验证和授权中间件')
  }
  
  if (vulnerabilityTypes.has('服务器端请求伪造(SSRF)漏洞')) {
    recommendations.push('🌐 验证和过滤用户输入，使用白名单限制允许的URL')
  }
  
  if (vulnerabilityTypes.has('使用已知漏洞的组件')) {
    recommendations.push('📦 更新所有依赖包到最新安全版本')
  }
  
  if (vulnerabilityTypes.has('API保护不足')) {
    recommendations.push('🛡️ 实施速率限制、CORS、安全头等保护措施')
  }
  
  if (vulnerabilityTypes.has('日志记录不足')) {
    recommendations.push('📝 实施全面的安全日志记录和监控')
  }
  
  // 通用建议
  recommendations.push('🔍 定期进行安全扫描和渗透测试')
  recommendations.push('📚 建立安全开发规范和代码审查流程')
  recommendations.push('🚨 实施安全事件响应计划')
  
  return recommendations
}

/**
 * 获取安全扫描历史
 */
export async function GET(request: NextRequest) {
  try {
    // 这里可以从数据库获取历史扫描记录
    // 目前返回模拟数据
    const mockHistory = [
      {
        id: '1',
        timestamp: Date.now() - 86400000, // 1天前
        totalIssues: 5,
        criticalIssues: 0,
        highIssues: 2,
        mediumIssues: 2,
        lowIssues: 1,
        score: 85,
        grade: 'B'
      },
      {
        id: '2',
        timestamp: Date.now() - 172800000, // 2天前
        totalIssues: 8,
        criticalIssues: 1,
        highIssues: 3,
        mediumIssues: 3,
        lowIssues: 1,
        score: 70,
        grade: 'C'
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockHistory
    })
  } catch (error) {
    console.error('获取安全扫描历史失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '获取安全扫描历史失败'
      },
      { status: 500 }
    )
  }
}
