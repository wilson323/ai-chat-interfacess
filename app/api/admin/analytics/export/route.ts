import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdvancedAnalyticsService } from '@/lib/services/advanced-analytics';
import { z } from 'zod';

// 导出参数验证
const exportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(['json', 'csv', 'excel']).default('json'),
  type: z.enum(['user-behavior', 'agent-performance', 'conversation', 'business-value', 'prediction', 'all']).default('all'),
  includeCharts: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const validatedQuery = exportQuerySchema.parse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      format: searchParams.get('format'),
      type: searchParams.get('type'),
      includeCharts: searchParams.get('includeCharts') === 'true',
    });

    // 设置默认日期范围（最近30天）
    const endDate = validatedQuery.endDate ? new Date(validatedQuery.endDate) : new Date();
    const startDate = validatedQuery.startDate ? new Date(validatedQuery.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 获取数据
    let data;
    if (validatedQuery.type === 'all') {
      const [
        userBehavior,
        agentPerformance,
        conversation,
        businessValue,
        prediction
      ] = await Promise.all([
        AdvancedAnalyticsService.getUserBehaviorAnalytics(startDate, endDate),
        AdvancedAnalyticsService.getAgentPerformanceAnalytics(startDate, endDate),
        AdvancedAnalyticsService.getConversationAnalytics(startDate, endDate),
        AdvancedAnalyticsService.getBusinessValueAnalytics(startDate, endDate),
        AdvancedAnalyticsService.getPredictionAnalytics(startDate, endDate),
      ]);

      data = {
        userBehavior,
        agentPerformance,
        conversation,
        businessValue,
        prediction,
        metadata: {
          generatedAt: new Date().toISOString(),
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        },
      };
    } else {
      switch (validatedQuery.type) {
        case 'user-behavior':
          data = await AdvancedAnalyticsService.getUserBehaviorAnalytics(startDate, endDate);
          break;
        case 'agent-performance':
          data = await AdvancedAnalyticsService.getAgentPerformanceAnalytics(startDate, endDate);
          break;
        case 'conversation':
          data = await AdvancedAnalyticsService.getConversationAnalytics(startDate, endDate);
          break;
        case 'business-value':
          data = await AdvancedAnalyticsService.getBusinessValueAnalytics(startDate, endDate);
          break;
        case 'prediction':
          data = await AdvancedAnalyticsService.getPredictionAnalytics(startDate, endDate);
          break;
      }
    }

    // 根据格式生成响应
    switch (validatedQuery.format) {
      case 'json':
        return NextResponse.json({
          success: true,
          data,
          metadata: {
            format: 'json',
            generatedAt: new Date().toISOString(),
          },
        });

      case 'csv':
        // 生成CSV格式的数据
        const csvData = convertToCSV(data);
        const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

        return new NextResponse(csvBlob, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        });

      case 'excel':
        // 生成Excel格式的HTML报表
        const htmlReport = generateHTMLReport(data, validatedQuery.includeCharts);
        const htmlBlob = new Blob([htmlReport], { type: 'text/html;charset=utf-8;' });

        return new NextResponse(htmlBlob, {
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.html"`,
          },
        });

      default:
        return NextResponse.json({ error: '不支持的导出格式' }, { status: 400 });
    }

  } catch (error) {
    console.error('数据导出API错误:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: '参数验证失败',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: '服务器内部错误',
      message: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}

// 将数据转换为CSV格式
function convertToCSV(data: any): string {
  const rows: string[] = [];

  // 简化的CSV转换逻辑
  if (data.userBehavior) {
    rows.push('用户行为分析');
    rows.push('小时,活跃用户数');
    data.userBehavior.hourlyActivity.forEach((item: any) => {
      rows.push(`${item.hour},${item.count}`);
    });
    rows.push('');
  }

  if (data.agentPerformance) {
    rows.push('智能体性能分析');
    rows.push('智能体ID,智能体名称,响应时间中位数,错误率,满意度');
    data.agentPerformance.responseTimeDistribution.forEach((agent: any) => {
      const errorRate = data.agentPerformance.errorRates.find((e: any) => e.agentId === agent.agentId);
      const satisfaction = data.agentPerformance.satisfactionAnalysis.find((s: any) => s.agentId === agent.agentId);
      rows.push(`${agent.agentId},"${agent.agentName}",${agent.median},${(errorRate?.errorRate * 100 || 0).toFixed(2)}%,${(satisfaction?.avgSatisfaction || 0).toFixed(2)}`);
    });
    rows.push('');
  }

  return rows.join('\n');
}

// 生成HTML报告
function generateHTMLReport(data: any, includeCharts: boolean): string {
  const generatedAt = new Date().toLocaleString('zh-CN');

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>高级分析报告</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 10px;
        }
        .metadata {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }
        .metric-label {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        .chart-placeholder {
            background: #f8f9fa;
            border: 2px dashed #ddd;
            border-radius: 8px;
            height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            margin: 20px 0;
        }
        .insight-box {
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .insight-box h3 {
            color: #2e7d32;
            margin-top: 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>高级数据分析报告</h1>
        <div class="metadata">
            生成时间: ${generatedAt}
        </div>

        ${data.summary ? `
        <div class="section">
            <h2>核心指标概览</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value">${data.summary.totalSessions?.toLocaleString() || 0}</div>
                    <div class="metric-label">总会话数</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.summary.activeUsers?.toLocaleString() || 0}</div>
                    <div class="metric-label">活跃用户</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${((data.summary.avgSatisfaction || 0) * 100).toFixed(1)}%</div>
                    <div class="metric-label">平均满意度</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">$${(data.summary.totalCost || 0).toFixed(2)}</div>
                    <div class="metric-label">总成本</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${(data.summary.roi || 0).toFixed(1)}%</div>
                    <div class="metric-label">投资回报率</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${(data.summary.predictedGrowth || 0).toFixed(1)}%</div>
                    <div class="metric-label">预测增长率</div>
                </div>
            </div>
        </div>
        ` : ''}

        ${data.userBehavior ? `
        <div class="section">
            <h2>用户行为分析</h2>
            ${includeCharts ? '<div class="chart-placeholder">[用户活跃度热力图]</div>' : ''}

            <h3>用户分群</h3>
            <table>
                <thead>
                    <tr>
                        <th>用户分群</th>
                        <th>用户数量</th>
                        <th>平均使用时长</th>
                        <th>平均满意度</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.userBehavior.userSegments.map((segment: any) => `
                        <tr>
                            <td>${segment.segment}</td>
                            <td>${segment.userCount}</td>
                            <td>${Math.round(segment.avgUsage)}秒</td>
                            <td>${segment.avgSatisfaction}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${data.agentPerformance ? `
        <div class="section">
            <h2>智能体性能分析</h2>
            ${includeCharts ? '<div class="chart-placeholder">[智能体性能雷达图]</div>' : ''}

            <h3>响应时间分布</h3>
            <table>
                <thead>
                    <tr>
                        <th>智能体名称</th>
                        <th>最小值</th>
                        <th>第一四分位数</th>
                        <th>中位数</th>
                        <th>第三四分位数</th>
                        <th>最大值</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.agentPerformance.responseTimeDistribution.map((agent: any) => `
                        <tr>
                            <td>${agent.agentName}</td>
                            <td>${agent.min}ms</td>
                            <td>${agent.q1}ms</td>
                            <td>${agent.median}ms</td>
                            <td>${agent.q3}ms</td>
                            <td>${agent.max}ms</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${data.businessValue ? `
        <div class="section">
            <h2>业务价值分析</h2>

            <h3>成本分析</h3>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value">${data.businessValue.costAnalysis.totalTokens?.toLocaleString() || 0}</div>
                    <div class="metric-label">总Token使用量</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">$${(data.businessValue.costAnalysis.estimatedCost || 0).toFixed(2)}</div>
                    <div class="metric-label">估计成本</div>
                </div>
            </div>

            <div class="insight-box">
                <h3>优化建议</h3>
                <ul>
                    ${data.businessValue.costAnalysis.optimizationSuggestions.map((suggestion: any) => `
                        <li><strong>${suggestion.type}:</strong> ${suggestion.description} (预计节省 $${suggestion.potentialSavings.toFixed(2)})</li>
                    `).join('')}
                </ul>
            </div>
        </div>
        ` : ''}

        ${data.prediction ? `
        <div class="section">
            <h2>预测分析</h2>
            ${includeCharts ? '<div class="chart-placeholder">[使用趋势预测图]</div>' : ''}

            <h3>资源需求预测</h3>
            <table>
                <thead>
                    <tr>
                        <th>建议类型</th>
                        <th>建议行动</th>
                        <th>时间框架</th>
                        <th>预期影响</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.prediction.resourceForecast.recommendations.map((rec: any) => `
                        <tr>
                            <td>${rec.type}</td>
                            <td>${rec.action}</td>
                            <td>${rec.timeframe}</td>
                            <td>${rec.impact}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="footer">
            <p>本报告由 NeuroGlass AI Chat Interface 系统自动生成</p>
            <p>数据准确性: ${data.prediction?.usageTrend?.accuracy || 85}% | 生成时间: ${generatedAt}</p>
        </div>
    </div>
</body>
</html>
  `;
}