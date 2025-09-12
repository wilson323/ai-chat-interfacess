import { NextRequest, NextResponse } from 'next/server'
import { redisManager } from '@/lib/cache/redis-manager'
import { cacheStrategyManager } from '@/lib/cache/cache-strategies'

// GET /api/admin/cache - 获取缓存状态和统计信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'stats'

    switch (action) {
      case 'stats':
        const stats = await redisManager.getStats()
        const strategies = cacheStrategyManager.getAllStrategies()
        const currentStrategy = cacheStrategyManager.getCurrentStrategy()
        
        return NextResponse.json({
          success: true,
          data: {
            stats,
            strategies: strategies.map(s => ({
              name: s.name,
              description: s.description,
              isActive: s.name === currentStrategy.name
            })),
            currentStrategy: {
              name: currentStrategy.name,
              description: currentStrategy.description
            }
          }
        })

      case 'hotkeys':
        const limit = parseInt(searchParams.get('limit') || '10')
        const hotKeys = await redisManager.getHotKeys(limit)
        
        return NextResponse.json({
          success: true,
          data: hotKeys
        })

      case 'optimize':
        const optimization = await cacheStrategyManager.optimize()
        
        return NextResponse.json({
          success: true,
          data: optimization
        })

      default:
        return NextResponse.json(
          { success: false, error: '无效的操作' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('获取缓存信息失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '获取缓存信息失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/cache - 执行缓存操作
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'setStrategy':
        const { strategyName } = params
        const success = cacheStrategyManager.setStrategy(strategyName)
        
        if (success) {
          return NextResponse.json({
            success: true,
            message: `缓存策略已切换到: ${strategyName}`
          })
        } else {
          return NextResponse.json(
            { success: false, error: '无效的缓存策略' },
            { status: 400 }
          )
        }

      case 'flushAll':
        const flushResult = await redisManager.flushAll()
        
        return NextResponse.json({
          success: flushResult,
          message: flushResult ? '所有缓存已清空' : '清空缓存失败'
        })

      case 'warmup':
        const { items } = params
        if (!Array.isArray(items)) {
          return NextResponse.json(
            { success: false, error: '预热数据格式错误' },
            { status: 400 }
          )
        }

        const currentStrategy = cacheStrategyManager.getCurrentStrategy()
        const warmupResult = await currentStrategy.warmup(items)
        
        return NextResponse.json({
          success: warmupResult,
          message: warmupResult ? `成功预热 ${items.length} 个缓存项` : '缓存预热失败'
        })

      case 'cleanup':
        const cleanedCount = await cacheStrategyManager.cleanup()
        
        return NextResponse.json({
          success: true,
          message: `清理了 ${cleanedCount} 个过期缓存项`
        })

      case 'optimize':
        const optimization = await cacheStrategyManager.optimize()
        
        // 应用优化建议
        if (optimization.newPolicy && Object.keys(optimization.newPolicy).length > 0) {
          cacheStrategyManager.updatePolicy(optimization.newPolicy)
        }
        
        return NextResponse.json({
          success: true,
          data: optimization,
          message: '缓存优化完成'
        })

      case 'set':
        const { key, value, ttl } = params
        if (!key || value === undefined) {
          return NextResponse.json(
            { success: false, error: '缺少必要的参数' },
            { status: 400 }
          )
        }

        const setResult = await redisManager.set(key, value, ttl)
        
        return NextResponse.json({
          success: setResult,
          message: setResult ? '缓存设置成功' : '缓存设置失败'
        })

      case 'get':
        const { key: getKey } = params
        if (!getKey) {
          return NextResponse.json(
            { success: false, error: '缺少键名' },
            { status: 400 }
          )
        }

        const value = await redisManager.get(getKey)
        
        return NextResponse.json({
          success: true,
          data: { key: getKey, value }
        })

      case 'delete':
        const { key: deleteKey } = params
        if (!deleteKey) {
          return NextResponse.json(
            { success: false, error: '缺少键名' },
            { status: 400 }
          )
        }

        const deleteResult = await redisManager.delete(deleteKey)
        
        return NextResponse.json({
          success: deleteResult,
          message: deleteResult ? '缓存删除成功' : '缓存删除失败'
        })

      default:
        return NextResponse.json(
          { success: false, error: '无效的操作' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('执行缓存操作失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '执行缓存操作失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/cache - 删除缓存
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { success: false, error: '缺少键名' },
        { status: 400 }
      )
    }

    const result = await redisManager.delete(key)
    
    return NextResponse.json({
      success: result,
      message: result ? '缓存删除成功' : '缓存删除失败'
    })
  } catch (error) {
    console.error('删除缓存失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '删除缓存失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
