/**
 * 基准测试工具函数
 */

import {
  BenchmarkResult,
  ChartData,
  GradeDistribution,
} from '../../types/benchmark';
import type { JsonValue, JsonObject } from '../../types/common';

/**
 * 获取等级颜色
 */
export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'bg-green-100 text-green-800';
    case 'B':
      return 'bg-blue-100 text-blue-800';
    case 'C':
      return 'bg-yellow-100 text-yellow-800';
    case 'D':
      return 'bg-orange-100 text-orange-800';
    case 'F':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * 获取等级图标
 */
export function getGradeIcon(grade: string) {
  const icons = {
    A: 'Award',
    B: 'TrendingUp',
    C: 'Activity',
    D: 'AlertTriangle',
    F: 'AlertTriangle',
  };
  return icons[grade as keyof typeof icons] || 'FileText';
}

/**
 * 获取分类图标
 */
export function getCategoryIcon(category: string) {
  const icons = {
    'page-load': 'Clock',
    api: 'Database',
    render: 'Activity',
    memory: 'Database',
    network: 'Wifi',
  };
  return icons[category as keyof typeof icons] || 'FileText';
}

/**
 * 格式化持续时间
 */
export function formatDuration(duration: number): string {
  if (duration < 1000) return `${Math.round(duration)}ms`;
  if (duration < 60000) return `${(duration / 1000).toFixed(2)}s`;
  return `${(duration / 60000).toFixed(2)}min`;
}

/**
 * 获取分类名称
 */
export function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    'page-load': '页面加载',
    api: 'API性能',
    render: '渲染性能',
    memory: '内存使用',
    network: '网络性能',
  };
  return names[category] || category;
}

/**
 * 格式化图表数据
 */
export function formatChartData(summary: JsonValue): ChartData[] {
  const categoryData = (summary as JsonObject)?.categoryScores || {};
  return Object.entries(categoryData).map(([category, score]) => ({
    category: getCategoryName(category),
    score: score as number,
  }));
}

/**
 * 获取等级分布
 */
export function getGradeDistribution(
  results: BenchmarkResult[]
): GradeDistribution[] {
  const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  const colors = {
    A: '#10B981',
    B: '#3B82F6',
    C: '#F59E0B',
    D: '#F97316',
    F: '#EF4444',
  };

  results.forEach(result => {
    if (result.success) {
      gradeCounts[result.metrics.grade]++;
    }
  });

  return Object.entries(gradeCounts).map(([grade, count]) => ({
    grade,
    count,
    color: colors[grade as keyof typeof colors] || '#6B7280',
  }));
}

/**
 * 导出结果
 */
export function exportResults(data: JsonValue, filename?: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download =
    filename ||
    `benchmark-results-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
