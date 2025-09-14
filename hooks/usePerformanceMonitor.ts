/**
 * 性能监控 React Hook
 * 提供性能监控的React接口
 */

import { useState, useEffect, useCallback } from 'react';
import { monitor, type PerformanceMetrics } from '@/lib/performance/monitor';

export interface PerformanceSummary {
  pageLoadTime: number;
  averageApiResponseTime: number;
  errorCount: number;
  resourceCount: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

export interface UsePerformanceMonitorReturn {
  metrics: PerformanceMetrics;
  summary: PerformanceSummary;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  resetMetrics: () => void;
  getReport: () => any;
}

/**
 * 性能监控 Hook
 */
export function usePerformanceMonitor(): UsePerformanceMonitorReturn {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(
    monitor.getMetrics()
  );
  const [isMonitoring, setIsMonitoring] = useState(true);

  // 更新指标
  const updateMetrics = useCallback(() => {
    setMetrics(monitor.getMetrics());
  }, []);

  // 定期更新指标
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(updateMetrics, 1000); // 每秒更新一次
    return () => clearInterval(interval);
  }, [isMonitoring, updateMetrics]);

  // 计算性能摘要
  const summary: PerformanceSummary = {
    pageLoadTime: metrics.pageLoadTime,
    averageApiResponseTime:
      metrics.apiCalls.length > 0
        ? metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0) /
          metrics.apiCalls.length
        : 0,
    errorCount: metrics.errors.length,
    resourceCount: metrics.resourceTimings.length,
    firstContentfulPaint: metrics.firstContentfulPaint,
    largestContentfulPaint: metrics.largestContentfulPaint,
    firstInputDelay: metrics.firstInputDelay,
    cumulativeLayoutShift: metrics.cumulativeLayoutShift,
  };

  // 开始监控
  const startMonitoring = useCallback(() => {
    monitor.setEnabled(true);
    setIsMonitoring(true);
    updateMetrics();
  }, [updateMetrics]);

  // 停止监控
  const stopMonitoring = useCallback(() => {
    monitor.setEnabled(false);
    setIsMonitoring(false);
  }, []);

  // 重置指标
  const resetMetrics = useCallback(() => {
    monitor.reset();
    updateMetrics();
  }, [updateMetrics]);

  // 获取报告
  const getReport = useCallback(() => {
    return monitor.getReport();
  }, []);

  return {
    metrics,
    summary,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    getReport,
  };
}

/**
 * 性能监控组件 Hook - 用于在组件中监控特定操作
 */
export function usePerformanceTracker() {
  const [trackedOperations, setTrackedOperations] = useState<
    Array<{
      name: string;
      startTime: number;
      endTime?: number;
      duration?: number;
    }>
  >([]);

  // 开始跟踪操作
  const startTracking = useCallback((operationName: string) => {
    const startTime = performance.now();
    setTrackedOperations(prev => [...prev, { name: operationName, startTime }]);
    return startTime;
  }, []);

  // 结束跟踪操作
  const endTracking = useCallback(
    (operationName: string, startTime?: number) => {
      const endTime = performance.now();
      const actualStartTime = startTime || performance.now();
      const duration = endTime - actualStartTime;

      setTrackedOperations(prev =>
        prev.map(op =>
          op.name === operationName && !op.endTime
            ? { ...op, endTime, duration }
            : op
        )
      );

      return duration;
    },
    []
  );

  // 获取操作统计
  const getOperationStats = useCallback(() => {
    const completed = trackedOperations.filter(op => op.endTime);
    const totalDuration = completed.reduce(
      (sum, op) => sum + (op.duration || 0),
      0
    );
    const averageDuration =
      completed.length > 0 ? totalDuration / completed.length : 0;

    return {
      totalOperations: trackedOperations.length,
      completedOperations: completed.length,
      totalDuration,
      averageDuration,
      operations: completed,
    };
  }, [trackedOperations]);

  // 清除跟踪记录
  const clearTracking = useCallback(() => {
    setTrackedOperations([]);
  }, []);

  return {
    startTracking,
    endTracking,
    getOperationStats,
    clearTracking,
    trackedOperations,
  };
}
