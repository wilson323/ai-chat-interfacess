/**
 * 性能基准测试相关类型定义
 */

export interface BenchmarkConfig {
  iterations: number;
  warmup: number;
  timeout: number;
}

export interface BenchmarkResult {
  id: string;
  suiteId: string;
  name: string;
  success: boolean;
  duration: number;
  metrics: {
    grade: string;
    score: number;
    category: string;
  };
  timestamp: number;
  error?: string;
}

export interface BenchmarkSuite {
  id: string;
  name: string;
  description: string;
  category: string;
  tests: string[];
}

export interface BenchmarkSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageScore: number;
  categoryScores: Record<string, number>;
  gradeDistribution: Record<string, number>;
  overallGrade: string;
}

export interface ChartData {
  category: string;
  score: number;
}

export interface GradeDistribution {
  grade: string;
  count: number;
  color: string;
}

export interface BenchmarkState {
  results: BenchmarkResult[];
  suites: BenchmarkSuite[];
  isRunning: boolean;
  currentSuite: string;
  config: BenchmarkConfig;
  summary: BenchmarkSummary | null;
  showConfig: boolean;
  selectedTab: string;
}
