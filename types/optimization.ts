/**
 * 性能优化相关类型定义
 */

export interface OptimizationAnalysis {
  totalOptimizations: number;
  highImpact: number;
  mediumImpact: number;
  lowImpact: number;
  easyImplementation: number;
  mediumImplementation: number;
  hardImplementation: number;
  estimatedImprovement: string;
  priorityOptimizations: PerformanceOptimization[];
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  totalImpact: number;
  optimizations: PerformanceOptimization[];
  icon: string | React.ComponentType<any>;
  color: string;
}

export interface PerformanceOptimization {
  id: string;
  title: string;
  description: string;
  category: 'frontend' | 'backend' | 'network' | 'code';
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedImprovement: string;
  implementation: string;
  priority: number;
  tags: string[];
}

export interface PerformanceSummary {
  overallScore: number;
  categoryScores: Record<string, number>;
  recommendations: string[];
  lastUpdated: string;
}

export interface OptimizationFilters {
  category: string;
  impact: 'all' | 'high' | 'medium' | 'low';
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
}

export interface OptimizationState {
  optimizations: PerformanceOptimization[];
  analysis: OptimizationAnalysis | null;
  categories: CategoryBreakdown[];
  currentSummary: PerformanceSummary | null;
  filters: OptimizationFilters;
  isAnalyzing: boolean;
  selectedTab: string;
}
