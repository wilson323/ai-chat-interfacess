/**
 * 性能优化工具函数
 */

import {
  PerformanceOptimization,
  CategoryBreakdown,
  OptimizationAnalysis,
} from '../../types/optimization';

/**
 * 计算估算改进效果
 */
export function calculateEstimatedImprovement(
  opts: PerformanceOptimization[]
): string {
  if (opts.length === 0) return '0%';

  const improvements = opts.map(opt => {
    const match = opt.estimatedImprovement.match(/(\d+)-(\d+)/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      return (min + max) / 2;
    }
    return 0;
  });

  const averageImprovement =
    improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
  return `${Math.round(averageImprovement)}%`;
}

/**
 * 计算分类统计
 */
export function calculateCategoryBreakdown(
  opts: PerformanceOptimization[]
): CategoryBreakdown[] {
  const categoryIcons = {
    frontend: 'Zap',
    backend: 'Database',
    network: 'Wifi',
    code: 'Code',
  };

  const categoryColors = {
    frontend: '#8884d8',
    backend: '#82ca9d',
    network: '#ffc658',
    code: '#ff7300',
  };

  const categoryNames = {
    frontend: '前端优化',
    backend: '后端优化',
    network: '网络优化',
    code: '代码优化',
  };

  return Object.entries(categoryIcons).map(([category, icon]) => {
    const categoryOpts = opts.filter(opt => opt.category === category);
    const totalImpact = categoryOpts.reduce((sum, opt) => {
      const impactWeight =
        opt.impact === 'high' ? 3 : opt.impact === 'medium' ? 2 : 1;
      return sum + impactWeight;
    }, 0);

    return {
      category: categoryNames[category as keyof typeof categoryNames],
      count: categoryOpts.length,
      totalImpact,
      optimizations: categoryOpts,
      icon,
      color: categoryColors[category as keyof typeof categoryColors],
    };
  });
}

/**
 * 执行优化分析
 */
export function performOptimizationAnalysis(
  opts: PerformanceOptimization[]
): OptimizationAnalysis {
  const totalOptimizations = opts.length;
  const highImpact = opts.filter(opt => opt.impact === 'high').length;
  const mediumImpact = opts.filter(opt => opt.impact === 'medium').length;
  const lowImpact = opts.filter(opt => opt.impact === 'low').length;

  const easyImplementation = opts.filter(
    opt => opt.difficulty === 'easy'
  ).length;
  const mediumImplementation = opts.filter(
    opt => opt.difficulty === 'medium'
  ).length;
  const hardImplementation = opts.filter(
    opt => opt.difficulty === 'hard'
  ).length;

  const estimatedImprovement = calculateEstimatedImprovement(opts);

  const priorityOptimizations = opts.filter(
    opt => opt.impact === 'high' && opt.difficulty === 'easy'
  );

  return {
    totalOptimizations,
    highImpact,
    mediumImpact,
    lowImpact,
    easyImplementation,
    mediumImplementation,
    hardImplementation,
    estimatedImprovement,
    priorityOptimizations,
  };
}

/**
 * 获取影响等级徽章样式
 */
export function getImpactBadgeClass(impact: string): string {
  switch (impact) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * 获取难度等级徽章样式
 */
export function getDifficultyBadgeClass(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * 获取影响等级文本
 */
export function getImpactText(impact: string): string {
  switch (impact) {
    case 'high':
      return '高影响';
    case 'medium':
      return '中等影响';
    case 'low':
      return '低影响';
    default:
      return '未知';
  }
}

/**
 * 获取难度等级文本
 */
export function getDifficultyText(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return '容易';
    case 'medium':
      return '中等';
    case 'hard':
      return '困难';
    default:
      return '未知';
  }
}

/**
 * 过滤优化建议
 */
export function filterOptimizations(
  optimizations: PerformanceOptimization[],
  filters: {
    category: string;
    impact: 'all' | 'high' | 'medium' | 'low';
    difficulty: 'all' | 'easy' | 'medium' | 'hard';
  }
): PerformanceOptimization[] {
  return optimizations.filter(opt => {
    if (filters.category !== 'all' && opt.category !== filters.category)
      return false;
    if (filters.impact !== 'all' && opt.impact !== filters.impact) return false;
    if (filters.difficulty !== 'all' && opt.difficulty !== filters.difficulty)
      return false;
    return true;
  });
}
